# Importing flask module in the project is mandatory
# An object of Flask class is our WSGI application.
from flask import Flask,redirect,url_for,render_template,request
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# Flask constructor takes the name of 
# current module (__name__) as argument.
app = Flask(__name__)
import os

# Assuming 'note.db' is in 'var/my-code-instance'
# db_path = os.path.join(os.getcwd(), 'var', 'my-code-instance', 'note.db')
# app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

#app configuration
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///note.db'
db=SQLAlchemy(app)

# The route() function of the Flask class is a decorator, 
@app.route('/')
def homescreen():
    Notes=Note.query.all()
    return render_template('index.html', notes=Notes if Notes else [])
    
#create a model
class Note(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    title=db.Column(db.String(80))
    description=db.Column(db.String(200))
    category=db.Column(db.String(20))
    completed = db.Column(db.Boolean, default=False)  # Boolean field for completed status
    timestamp = db.Column(db.DateTime, default=datetime.utcnow) 



# fetching data from form
@app.route('/submit', methods=['GET', 'POST'])
def fetch():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        category = request.form['category']
        completed = request.form.get('completed') == 'on'  # Will be True if checked, else False
        
        new_note = Note(title=title, description=description, category=category, completed=completed)
        
        db.session.add(new_note)
        db.session.commit()

        return {
            'id': new_note.id,
            'title': new_note.title,
            'description': new_note.description,
            'category': new_note.category,
            'completed': new_note.completed,
            'timestamp': new_note.timestamp.strftime('%Y-%m-%d %H:%M:%S')  # Format timestamp if needed
        }, 201  # Return HTTP 201 Created


@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_note(id):
    note = Note.query.get(id)
    if note:
        db.session.delete(note)
        db.session.commit()
        return '', 204
    return "Note not found", 404

@app.route('/update/<int:id>', methods=['POST'])
def update_note(id):
    note = Note.query.get(id)
    if note:
        note.title = request.form['title']
        note.description = request.form['description']
        note.category = request.form['category']
        note.completed = request.form.get('completed') == 'on'  # Update completed status
        db.session.commit()
        return {
            'id': note.id,
            'title': note.title,
            'description': note.description,
            'category': note.category,
            'completed': note.completed
        }, 200  # Return HTTP 200 OK
    return {"error": "Note not found"}, 404  # Return 404 if note not found



# main driver function
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5001,debug=True)

