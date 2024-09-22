from flask import Flask, jsonify, render_template, request
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# App configuration
db_path = os.path.join(os.path.dirname(__file__), 'my_note.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
db = SQLAlchemy(app)

# Note model
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(80))
    description = db.Column(db.String(200))
    category = db.Column(db.String(20))
    completed = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    color = db.Column(db.String(7))  # Store color for the note

# Fetch and render notes on the homepage
@app.route('/')
def homescreen():
    Notes = Note.query.all()
    return render_template('index.html', notes=Notes if Notes else [])

# Handle note submission (adding a new note)
@app.route('/add_note', methods=['POST'])
def add_note():
    data = request.get_json()  # Get the JSON data from the request
    title = data['title']
    description = data['description']
    category = data['category']
    completed = data['completed']
    color = data['color']  # Get the color sent from the frontend

    # Create a new note
    new_note = Note(title=title, description=description, category=category, completed=completed, color=color)
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
def update_note(id):
    data = request.get_json()
    note = Note.query.get(id)
    if note:
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
def delete_note(id):
    note = Note.query.get(id)
    if note:
        db.session.delete(note)
        db.session.commit()
        return '', 204
    return jsonify({'error': 'Note not found'}), 404

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(port=5001, debug=True)
