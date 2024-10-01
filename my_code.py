from flask import Flask, jsonify, render_template, request,redirect, url_for, flash
app = Flask(__name__)
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import UserMixin, login_user, LoginManager, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
import re



app.secret_key = 'supersecretkey'

# App configuration
db_path = os.path.join(os.path.dirname(__file__), 'latest_notes.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    notes = db.relationship('Note', backref='user', lazy=True)
    email=db.Column(db.String(30),unique=True,nullable=False)
# Note model
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80))
    description = db.Column(db.String(200))
    category = db.Column(db.String(20))
    completed = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    color = db.Column(db.String(7))  # Store color for the note
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        email=request.form['email']
        password = request.form['password']
        hashed_password = generate_password_hash(password)

        if not is_valid_email(email):
            flash('Invalid email format. Please enter a valid email.','invalid-email')
            return redirect(url_for('signup'))
        
        # existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        existing_user = User.query.filter((User.email == email)).first()

        if existing_user:
            # if existing_user.username == username:
            #      flash('Username already exists. Please Login.','username-exists')
            if existing_user.email == email:
                flash('Email already registered. Please Login','email-exists')
            return redirect(url_for('signup'))
        
        user = User(username=username, password=hashed_password,email=email)
        db.session.add(user)
        db.session.commit()
        flash('Signup successful! Please log in.','registered-user')
        return redirect(url_for('login'))
       
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        # Validate email format
        if not is_valid_email(email):
            flash('Invalid email address.','invalid-email')
            return redirect(url_for('login'))

        user = User.query.filter_by(email=email).first()

        if user:  # Email exists
            if check_password_hash(user.password, password):  # Password is correct
                login_user(user)
                return redirect(url_for('homescreen'))
            else:  # Password is incorrect
                flash('Incorrect password.','user-exists-pw-incorrect')
                return redirect(url_for('login'))
        else:  # Email does not exist
            flash('Email not found','user-doesnt-exist')
            return redirect(url_for('login'))

    return render_template('login.html')



@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


# Fetch and render notes on the homepage
@app.route('/')
@login_required
def homescreen():
    user_notes = Note.query.filter_by(user_id=current_user.id).all()
    return render_template('index.html', notes=user_notes if user_notes else [],username=current_user.username)

# Handle note submission (adding a new note)
@app.route('/add_note', methods=['POST'])
@login_required
def add_note():
    data = request.get_json()  # Get the JSON data from the request
    title = data['title']
    description = data['description']
    category = data['category']
    completed = data['completed']
    color = data['color']  # Get the color sent from the frontend

    # Create a new note
    new_note = Note(title=title, description=description, category=category, completed=completed, color=color,user_id=current_user.id)
    db.session.add(new_note)
    db.session.commit()

    return jsonify({
        'id': new_note.id,
        'title': new_note.title,
        'description': new_note.description,
        'category': new_note.category,
        'completed': new_note.completed,
        'color': new_note.color,
        'timestamp': new_note.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    }), 201

# Handle note update
@app.route('/update_note/<int:id>', methods=['POST'])
@login_required
def update_note(id):
    data = request.get_json()
    note = Note.query.get(id)
    if note and note.user_id == current_user.id:
        note.title = data['title']
        note.description = data['description']
        note.category = data['category']
        note.completed = data['completed']
        note.color = data['color']
        db.session.commit()
        return jsonify({
            'id': note.id,
            'title': note.title,
            'description': note.description,
            'category': note.category,
            'completed': note.completed,
            'color': note.color,
            'timestamp': note.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }), 200
    return jsonify({'error': 'Note not found'}), 404

# Handle note deletion
@app.route('/delete_note/<int:id>', methods=['DELETE'])
@login_required
def delete_note(id):
    note = Note.query.get(id)
    if note and note.user_id == current_user.id:
        db.session.delete(note)
        db.session.commit()
        return '', 204
    return jsonify({'error': 'Note not found'}), 404



with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(port=5001, debug=True)
