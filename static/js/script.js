// document.addEventListener("DOMContentLoaded", function() {
//     const addbtn = document.getElementById("add-button");
//     const notescontainer = document.querySelector(".notes");
//     const noteFormModal = document.getElementById("note-form");
//     const addNoteForm = document.getElementById("add-note-form");
//     const closeBtn = document.querySelector(".close");
//     const titleInput = document.getElementById("note-title");
//     const descriptionInput = document.getElementById("note-description");
//     const categoryInput = document.getElementById("note-category");
//     const modalTitle = document.getElementById("modal-title");
//     const submitButton = document.getElementById("submit-button");
//     const searchInput = document.getElementById("search-input");
//     const showCompletedCheckbox = document.getElementById("show-completed");

//     let editingNote = null; // Variable to track the note being edited

//     function display() {
//         const savednotes = JSON.parse(localStorage.getItem("notes")) || [];
//         savednotes.forEach(note => {
//             createNoteElement(note);
//         });
//         filterNotes(showCompletedCheckbox.checked);
//     }
//     display();

//     searchInput.addEventListener("keyup", () => {
//         const searchTerm = searchInput.value.toLowerCase();
//         const notes = document.querySelectorAll(".input-box");

//         notes.forEach(note => {
//             const title = note.querySelector(".note-title").innerText.toLowerCase();
//             const description = note.querySelector(".note-description").innerText.toLowerCase();

//             if (title.includes(searchTerm) || description.includes(searchTerm)) {
//                 note.style.display = "block"; // Show matching note
//             } else {
//                 note.style.display = "none"; // Hide non-matching note
//             }
//         });
//     });

//     function attachEventListeners() {
//         notescontainer.addEventListener('click', (e) => {
//             const inputbox = e.target.closest('.input-box');

//             if (e.target.id === 'delete') {
//                 const noteId = inputbox.getAttribute('data-id');
//                 deleteNoteById(noteId);
//                 inputbox.remove();
//             } else if (e.target.id === 'edit') {
//                 const title = inputbox.querySelector('.note-title').innerText;
//                 const description = inputbox.querySelector('.note-description').innerHTML.replace(/<br>/g, '\n');
//                 const category = inputbox.querySelector('.note-category').innerText;

//                 editingNote = inputbox;
//                 titleInput.value = title;
//                 descriptionInput.value = description;
//                 categoryInput.value = category;
//                 modalTitle.textContent = "Edit Note";
//                 submitButton.textContent = "Save Changes";
//                 noteFormModal.style.display = "block"; // Show the form
//             } else if (e.target.classList.contains('note-completed')) {
//                 const noteId = inputbox.getAttribute('data-id');
//                 update();
//             }
//         });
//     }

//     function update() {
//         const notes = [];
//         notescontainer.querySelectorAll(".input-box").forEach(box => {
//             const id = box.getAttribute("data-id");
//             const name = box.querySelector(".note-title").innerText || '';
//             const description = box.querySelector(".note-description").innerHTML.replace(/<br>/g, '\n') || '';
//             const timestamp = box.getAttribute("data-timestamp");
//             const category = box.querySelector(".note-category").innerText || '';
//             const completed = box.querySelector(".note-completed").checked;
//             notes.push({ id, name, description, timestamp, category, completed });
//         });
//         localStorage.setItem("notes", JSON.stringify(notes));
//     }

//     addbtn.addEventListener('click', () => {
//         editingNote = null;
//         titleInput.value = '';
//         descriptionInput.value = '';
//         categoryInput.value = 'business';
//         modalTitle.textContent = "Add New Note";
//         submitButton.textContent = "Add Note";
//         noteFormModal.style.display = "block"; // Show the form
//     });

//     closeBtn.addEventListener('click', () => {
//         noteFormModal.style.display = "none"; // Close the form
//     });

//     window.addEventListener('click', (event) => {
//         if (event.target == noteFormModal) {
//             noteFormModal.style.display = "none"; // Close the form if clicking outside the modal
//         }
//     });

//     addNoteForm.addEventListener('submit', (e) => {
//         e.preventDefault();

//         const noteTitle = titleInput.value;
//         const noteDescription = descriptionInput.value.replace(/\n/g, '<br>');
//         const noteCategory = categoryInput.value;

//         if (editingNote) {
//             editingNote.querySelector('.note-title').innerText = noteTitle;
//             editingNote.querySelector('.note-description').innerHTML = noteDescription;
//             editingNote.querySelector('.note-category').innerText = noteCategory;
//             editingNote.querySelector('.note-date').innerText = getCurrentDate();
//             update();
//         } else {
//             const uniqueId = generateUniqueId();
//             const creationDate = getCurrentDate();

//             const note = {
//                 id: uniqueId,
//                 name: noteTitle,
//                 description: noteDescription,
//                 timestamp: creationDate,
//                 category: noteCategory,
//                 completed: false
//             };

//             createNoteElement(note);
//             update();
//         }

//         addNoteForm.reset(); // Reset the form fields
//         noteFormModal.style.display = "none"; // Close the modal
//     });

//     function createNoteElement(note) {
//         let inputbox = document.createElement("div");
//         inputbox.className = "input-box";
//         inputbox.setAttribute("data-id", note.id);
//         inputbox.setAttribute("data-timestamp", note.timestamp);
//         const completedChecked = note.completed ? 'checked' : '';
//         const formattedDescription = note.description.replace(/\n/g, '<br>');

//         inputbox.innerHTML = `
//             <div class="note-title">${note.name}</div>
//             <p class="note-description">${formattedDescription}</p>
//             <p class="note-category">${note.category}</p>
//             <p class="note-date">${note.timestamp}</p>
//             <input type="checkbox" class="note-completed" ${completedChecked} id="completed">
//             <img src="/static/images/delete_button.png" alt="delete icon" id="delete">
//             <img src="/static/images/edit_button.png" alt="edit icon" id="edit">
//         `;

//         notescontainer.appendChild(inputbox);
//         attachEventListeners();
//     }

//     function deleteNoteById(id) {
//         let notes = JSON.parse(localStorage.getItem("notes")) || [];
//         notes = notes.filter(note => note.id !== id);
//         localStorage.setItem("notes", JSON.stringify(notes));
//     }

//     function generateUniqueId() {
//         return `${Math.floor(Math.random() * 1000000)}`; // Improved uniqueness
//     }

//     function getCurrentDate() {
//         const now = new Date();
//         return now.toLocaleString();
//     }

//     showCompletedCheckbox.addEventListener('change', () => {
//         const isChecked = showCompletedCheckbox.checked;
//         filterNotes(isChecked);
//     });

//     function filterNotes(showCompleted) {
//         const notes = document.querySelectorAll(".input-box");
//         notes.forEach(note => {
//             const isCompleted = note.querySelector(".note-completed").checked;
//             if (showCompleted && !isCompleted) {
//                 note.style.display = "none"; // Hide if not completed
//             } else {
//                 note.style.display = "block"; // Show if completed or checkbox is not checked
//             }
//         });
//     }
// });
















document.addEventListener("DOMContentLoaded", function() {
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
    const colors = ['#d64f6f', '#be6a0a', '#4d61c0', '#36b4a6', '#cc5dbc', '#d49d29'];
    let editingNoteId = null; // Variable to track the note being edited

    // function generateUniqueId() {
    //     return Date.now(); // Using current timestamp as a unique ID
    // }
    // function getCurrentDate() {
    //     const now = new Date();
    //     return now.toISOString().split('T')[0]; // Returns the date in YYYY-MM-DD format
    // }
    
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
        editingNoteId = null;// Close the form
    });

    window.addEventListener('click', (event) => {
        if (event.target == noteFormModal) {
            noteFormModal.style.display = "none"; // Close the form if clicking outside the modal
        }
    });

    // Submit new note or update existing note
    addNoteForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission
        //we are storing the user inputs into different variables
        const noteTitle = titleInput.value;
        const noteDescription = descriptionInput.value.replace(/\n/g, '<br>');
        const noteCategory = categoryInput.value;
        const completed = document.querySelector('#completed-checkbox')?.checked || false;
        const noteColor = colors[Math.floor(Math.random() * colors.length)];
        if (editingNoteId) {
            // Update existing note
            fetch(`/update_note/${editingNoteId}`, { //here we are sending the data obtained as a json file to the server
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({  //converting the data into json
                    'title': noteTitle,
                    'description': noteDescription,
                    'category': noteCategory,
                    'completed': completed,
                    'color': noteColor
                    
                })
            })
            
            .then(response => {   //after sending the json data,the server creates a new note or edits ,sends a response object
                if (response.ok) {
                    return response.json(); // Parse the JSON response
                } else {
                    console.error('Update failed:', response.status);
                    alert('Failed to update the note.'); // Notify the user
                }
            })
            .then(updatedNote => {  //now we have to send the obtained response back to the dom to dynamically change the screen
                // Update the note in the DOM without refreshing
                const inputBox = notesContainer.querySelector(`[data-id="${updatedNote.id}"]`);
                if (inputBox) {  // Check if inputBox is found
                    inputBox.querySelector('.note-title').innerText = updatedNote.title;
                    inputBox.querySelector('.note-description').innerHTML = updatedNote.description;
                    inputBox.querySelector('.note-category').innerText = updatedNote.category;
                    inputBox.querySelector('.note-completed').checked = updatedNote.completed;
                    inputBox.style.backgroundColor = updatedNote.color;
                } else {
                    console.error('Note not found in the DOM');
                }

                // Reset editingNoteId and close the modal
                
                noteFormModal.style.display = "none"; // Close the modal
                editingNoteId = null;
            })
            .catch(error => console.error('Error:', error));
        } else {
            // Add a new note
            fetch('/add_note', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify({
                    title: noteTitle,
                    description: noteDescription,
                    category: noteCategory,
                    completed: false,
                    color: noteColor  // or true, depending on your need
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Get the JSON response
                } else {
                    console.error('Failed to add note:', response.status);
                    alert('Failed to add note.'); // Notify the user
                }
            })
            .then(newNote => {
                const note = {
                    id: newNote.id, // Get ID from response
                    name: noteTitle,
                    description: noteDescription,
                    timestamp: newNote.timestamp, // or use newNote.timestamp if you get it from the server
                    category: noteCategory,
                    completed: false,
                    color: noteColor
                    
                };
                createNoteElement(note); // Call your function to create a new note element
                noteFormModal.style.display = "none"; // Close the modal
            })
            .catch(error => console.error('Error:', error));
        }
    
        // Reset the editing note ID
        editingNoteId = null;
    });
    
    function getRandomColor() {
        const colors = ['#d64f6f', '#be6a0a', '#4d61c0', '#36b4a6', '#cc5dbc', '#d49d29'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Search functionality
    searchInput.addEventListener("keyup", () => { //keyup is an event which is triggered when user stops typing on keyboard
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

    // Checkbox to show completed notes
    showCompletedCheckbox.addEventListener('change', () => {
        const isChecked = showCompletedCheckbox.checked;
        filterNotes(isChecked);
    });

    function filterNotes(showCompleted) {
        const notes = document.querySelectorAll(".input-box");
        notes.forEach(note => {
            const isCompleted = note.querySelector(".note-completed").checked;  
            if (showCompleted && !isCompleted) {
                note.style.display = "none"; // Hide if not completed
            } else {
                note.style.display = "block"; // Show if completed or checkbox is not checked
            }
        });
    }

    // Attach event listeners for edit and delete buttons
    notesContainer.addEventListener('click', (e) => {
        console.log('Click detected:', e.target); // Log the clicked element;
        const inputBox = e.target.closest('.input-box');
        if (!inputBox) return;
        const noteId = inputBox.getAttribute('data-id');

        if (e.target.closest('.delete-button') || e.target.classList.contains('delete')) {
            deleteNoteById(noteId, inputBox);
        } else if (e.target.closest('.edit-button') || e.target.classList.contains('edit')) {
            console.log('Editing note ID:', noteId);
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
        console.log('Edit button clicked for note ID:', id); 
        if (!inputBox) return;
        editingNoteId = id; // Store the ID of the note being edited
        const title = inputBox.querySelector('.note-title').innerText;
        const description = inputBox.querySelector('.note-description').innerHTML.replace(/<br>/g, '\n');
        const category = inputBox.querySelector('.note-category').innerText;
        const isCompleted = inputBox.querySelector('.note-completed').checked;
        if(title && description && category){
            // Set values in the modal
        titleInput.value = title;
        descriptionInput.value = description;
        categoryInput.value = category;
        document.querySelector('#completed-checkbox').checked = isCompleted;

        modalTitle.textContent = "Edit Note";
        submitButton.textContent = "Save Changes";
        noteFormModal.style.display = "block"; // Show the modal
        }
        
    }

    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'input-box';
        noteElement.setAttribute('data-id', note.id);
        noteElement.style.backgroundColor = note.color;  // Apply the note's color
        
        noteElement.innerHTML = `
            <div class="note-title">${note.name}</div>
            <p class="note-description">${note.description}</p>
            <p class="note-category">${note.category}</p>
            <p class="note-date">${note.timestamp}</p>
            <input type="checkbox" class="note-completed" ${note.completed ? 'checked' : ''} id="completed-checkbox-${note.id}">
            <button class="delete-button">
                <img src="/static/images/delete_button.png" alt="delete icon" class="delete">
            </button>
            <button class="edit-button">
                <img src="/static/images/edit_button.png" alt="edit icon" class="edit">
            </button>
        `;
        
        notesContainer.appendChild(noteElement);
    }
    
    
});
