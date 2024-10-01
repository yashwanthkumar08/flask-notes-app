document.addEventListener("DOMContentLoaded", function () {
    // Existing variables
    const addbtn = document.getElementById("add-button");
    const noteFormModal = document.getElementById("note-form");
    const addNoteForm = document.getElementById("add-note-form");
    const closeBtn = document.querySelector(".close");
    const titleInput = document.getElementById("note-title");
    const descriptionInput = document.getElementById("note-description");
    const categoryInput = document.getElementById("note-category");
    const modalTitle = document.getElementById("modal-title");
    const submitButton = document.getElementById("submit-button");
    const searchInput = document.getElementById("search-input");
    const showCompletedCheckbox = document.getElementById("show-completed");
    const notesContainer = document.querySelector(".notes");
    const colors =  ['#F8E0F0'];
    let editingNoteId = null; // Variable to track the note being edited
    const categoryItems = document.querySelectorAll('.categories li');
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('sidebar-toggle')

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const filterValue = item.getAttribute('data-filter');
            filterNotes(filterValue);
        });
    });

    // Event listener for the "Show Completed" checkbox
showCompletedCheckbox.addEventListener('change', () => {
    filterCompletedNotes();
});

function filterCompletedNotes() {
    const notes = document.querySelectorAll(".input-box");
    const showCompleted = showCompletedCheckbox.checked;

    notes.forEach(note => {
        const isCompleted = note.querySelector('.note-completed').checked;
        
        // Show only the completed notes if the checkbox is checked
        if (showCompleted && !isCompleted) {
            note.style.display = 'none'; // Hide uncompleted notes
        } else {
            note.style.display = 'block'; // Show all notes if unchecked or if completed
        }
    });
}

    function filterNotes(category) {
        const notes = document.querySelectorAll(".input-box");
        notes.forEach(note => {
            const noteCategory = note.querySelector('.note-category').innerText.toLowerCase();
            // Check if the selected category is 'all' or matches the note's category
            if (category === 'all' || noteCategory === category) {
                note.style.display = 'block'; // Show the note
            } else {
                note.style.display = 'none'; // Hide the note
            }
        });

        // Update active category style
        updateActiveCategory(category);
    }

    function updateActiveCategory(selectedCategory) {
        categoryItems.forEach(item => {
            // Remove active class from all category items
            item.classList.remove('active');
            // Add active class to the selected category
            if (item.getAttribute('data-filter') === selectedCategory) {
                item.classList.add('active');
            }
        });
    }

    // Event listener for adding a new note
    addbtn.addEventListener('click', () => {
        titleInput.value = '';
        descriptionInput.value = '';
        categoryInput.value = 'business';
        modalTitle.textContent = "Add New Note";
        submitButton.textContent = "Add Note";
        editingNoteId = null; 
        noteFormModal.style.display = "block"; // Show the form
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        noteFormModal.style.display = "none"; 
        editingNoteId = null; // Close the form
    });

    window.addEventListener('click', (event) => {
        if (event.target == noteFormModal) {
            noteFormModal.style.display = "none"; // Close the form if clicking outside the modal
        }
    });

    // Submit new note or update existing note
   // Submit new note or update existing note
addNoteForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission      

    const noteTitle = titleInput.value;       
    const noteDescription = descriptionInput.value.replace(/\n/g, '<br>');       
    const noteCategory = categoryInput.value;   
    const completed = false; 
    const noteColor = colors[Math.floor(Math.random() * colors.length)];

    // Check if we're editing an existing note
    if (editingNoteId) {       
        // Update existing note
        fetch(`/update_note/${editingNoteId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: noteTitle,
                description: noteDescription,
                category: noteCategory,
                completed: completed,
                color: noteColor
            })
        })
        .then(response => response.json())
        .then(updatedNote => {
            updateNoteInDOM(updatedNote);
            noteFormModal.style.display = "none"; // Close the modal
            editingNoteId = null; // Reset editing note ID
        })
        .catch(error => console.error('Error:', error));

    } else {
        // Add a new note
        fetch('/add_note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: noteTitle,
                description: noteDescription,
                category: noteCategory,
                completed: false,
                color: noteColor
            })
        })
        .then(response => response.json())
        .then(newNote => {
            createNoteElement(newNote); // Call function to create a new note element
            noteFormModal.style.display = "none"; // Close the modal
        })
        .catch(error => console.error('Error:', error));
    }
});

    // Search functionality
    searchInput.addEventListener("keyup", () => {
        const searchTerm = searchInput.value.toLowerCase();
        const notes = document.querySelectorAll(".input-box");

        notes.forEach(note => {
            const title = note.querySelector(".note-title").innerText.toLowerCase();   
            const description = note.querySelector(".note-description").innerText.toLowerCase();  

            if (title.includes(searchTerm) || description.includes(searchTerm)) {   
                note.style.display = "block"; // Show matching note
            } else {
                note.style.display = "none"; // Hide non-matching note
            }
        });
    });

    // Attach event listeners for edit and delete buttons
    notesContainer.addEventListener('click', (e) => {
        const inputBox = e.target.closest('.input-box');
        if (!inputBox) return;
        const noteId = inputBox.getAttribute('data-id');

        if (e.target.closest('.delete-button') || e.target.classList.contains('delete')) {
            deleteNoteById(noteId, inputBox);
        } else if (e.target.closest('.edit-button') || e.target.classList.contains('edit')) {
            editNoteById(noteId, inputBox);
        }
    });

    function deleteNoteById(id, inputBox) {
        fetch(`/delete_note/${id}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    inputBox.remove(); // Remove the note from the DOM
                } else {
                    console.error('Delete failed:', response.status);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function editNoteById(id, inputBox) {
        if (!inputBox) return;
        editingNoteId = id; // Store the ID of the note being edited
        const title = inputBox.querySelector('.note-title').innerText;
        const description = inputBox.querySelector('.note-description').innerHTML.replace(/<br>/g, '\n');
        const category = inputBox.querySelector('.note-category').innerText;
        const isCompleted = inputBox.querySelector('.note-completed').checked;

        // Set values in the modal
        titleInput.value = title;
        descriptionInput.value = description;
        categoryInput.value = category;
        document.querySelector('#completed-checkbox').checked = isCompleted;

        modalTitle.textContent = "Edit Note";
        submitButton.textContent = "Save Changes";
        noteFormModal.style.display = "block"; // Show the modal
    }
    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('input-box');
        noteElement.setAttribute('data-id', note.id);
        noteElement.setAttribute('data-timestamp', note.timestamp);
        noteElement.style.backgroundColor = note.color;
    
        noteElement.innerHTML = `
            <div class="note-title">${note.title}</div>
            <p class="note-description">${note.description}</p>
            <p class="note-category">${note.category}</p>
            <p class="note-date">${note.timestamp}</p>
            
            <div class="checkbox-icons-container">
                <input type="checkbox" class="note-completed" ${note.completed ? 'checked' : ''} id="completed-checkbox-${note.id}">
                <label for="completed-checkbox-${note.id}">C</label> 
    
                <div class="modify-buttons">
                    <button class="edit-button">
                        <img src="/static/images/edit_button.png" alt="edit icon" class="edit">
                        <div class="delete-name">Delete</div>
                    </button>
                    <button class="delete-button">
                        <img src="/static/images/delete_button.png" alt="delete icon" class="delete">
                        <div class="edit-name">Edit</div>
                    </button>
                </div>
            </div>
        `;
    
        notesContainer.appendChild(noteElement); // Ensure this is where notes are appended
    }
        function updateNoteInDOM(updatedNote) {
        const inputBox = notesContainer.querySelector(`[data-id="${updatedNote.id}"]`);
        if (inputBox) {
          inputBox.innerHTML = `
            <div class="note-title">${updatedNote.title}</div>
            <div class="note-description">${updatedNote.description}</div>
            <div class="note-category">${updatedNote.category}</div>
            <input type="checkbox" class="note-completed" ${updatedNote.completed ? 'checked' : ''} />
            <button class="delete-button">
              <img src="/static/images/delete_button.png" alt="delete icon" class="delete">
              <div class="delete-name">Delete</div>
            </button>
            <button class="edit-button">
              <img src="/static/images/edit_button.png" alt="edit icon" class="edit">
              <div class="edit-name">Edit</div>
            </button>
          `;
        }
      }
});
