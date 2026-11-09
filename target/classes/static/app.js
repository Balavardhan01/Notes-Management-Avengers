// Simple Notes Management App
const API_URL = window.location.port === '8080' ? '/api/notes' : 'http://localhost:8080/api/notes';

let notes = [];
let showingArchived = false;

// Load notes when page loads
window.onload = function() {
    loadNotes();
};

function loadNotes() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            notes = data;
            updateCategoryDropdown();
            renderNotes();
        })
        .catch(err => {
            console.error("Error fetching notes:", err);
            document.getElementById('notes-list').innerHTML = 
                '<p style="color: red;">Could not connect to Spring Boot backend at ' + API_URL + '</p>';
        });
}

function renderNotes() {
    const list = document.getElementById('notes-list');
    list.innerHTML = '';

    const searchText = document.getElementById('search').value.toLowerCase();
    const selectedCategory = document.getElementById('category-filter').value;

    const filtered = notes.filter(n => {
        const matchesTab = (n.archived === showingArchived);
        const matchesSearch = n.title && n.title.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === '' || (n.category && n.category.toLowerCase() === selectedCategory.toLowerCase());
        return matchesTab && matchesSearch && matchesCategory;
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p>No notes found.</p>';
        return;
    }

    filtered.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-card' + (note.important ? ' important' : '');

        div.innerHTML = `
            <h3>
                ${escapeText(note.title)}
                <span class="category-tag">${escapeText(note.category || 'General')}</span>
                ${note.important ? '<span class="important-tag">⭐ Important</span>' : ''}
            </h3>
            <p>${escapeText(note.content)}</p>
            <div>
                <button onclick="editNote(${note.id})">Edit</button>
                <button onclick="toggleImportant(${note.id})">${note.important ? 'Mark Normal' : 'Mark Important'}</button>
                <button onclick="toggleArchive(${note.id})">${note.archived ? 'Unarchive' : 'Archive'}</button>
                <button class="delete-btn" onclick="deleteNote(${note.id})">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

function saveNote() {
    const id = document.getElementById('note-id').value;
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value.trim();
    const content = document.getElementById('content').value.trim();
    const important = document.getElementById('important').checked;

    if (!title || !content) {
        alert("Please enter both title and content!");
        return;
    }

    const noteData = {
        title: title,
        category: category || 'General',
        content: content,
        important: important,
        archived: false
    };

    if (id) {
        // Keep existing archived status when updating
        const existing = notes.find(n => n.id == id);
        if (existing) {
            noteData.archived = existing.archived;
        }

        fetch(API_URL + '/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        })
        .then(() => {
            resetForm();
            loadNotes();
        })
        .catch(err => console.error("Error updating note:", err));
    } else {
        fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        })
        .then(() => {
            resetForm();
            loadNotes();
        })
        .catch(err => console.error("Error creating note:", err));
    }
}

function editNote(id) {
    const note = notes.find(n => n.id == id);
    if (!note) return;

    document.getElementById('note-id').value = note.id;
    document.getElementById('title').value = note.title;
    document.getElementById('category').value = note.category || '';
    document.getElementById('content').value = note.content;
    document.getElementById('important').checked = note.important;

    document.getElementById('form-title').innerText = 'Edit Note';
    document.getElementById('save-btn').innerText = 'Update Note';
    document.getElementById('cancel-btn').style.display = 'inline-block';
}

function resetForm() {
    document.getElementById('note-id').value = '';
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    document.getElementById('content').value = '';
    document.getElementById('important').checked = false;

    document.getElementById('form-title').innerText = 'Add New Note';
    document.getElementById('save-btn').innerText = 'Add Note';
    document.getElementById('cancel-btn').style.display = 'none';
}

function toggleArchive(id) {
    const note = notes.find(n => n.id == id);
    if (!note) return;

    note.archived = !note.archived;

    fetch(API_URL + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
    })
    .then(() => loadNotes())
    .catch(err => console.error("Error toggling archive:", err));
}

function toggleImportant(id) {
    const note = notes.find(n => n.id == id);
    if (!note) return;

    note.important = !note.important;

    fetch(API_URL + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note)
    })
    .then(() => loadNotes())
    .catch(err => console.error("Error toggling importance:", err));
}

function deleteNote(id) {
    if (!confirm("Delete this note?")) return;

    fetch(API_URL + '/' + id, {
        method: 'DELETE'
    })
    .then(() => loadNotes())
    .catch(err => console.error("Error deleting note:", err));
}

function showTab(archived) {
    showingArchived = archived;
    document.getElementById('active-tab-btn').className = archived ? '' : 'active';
    document.getElementById('archived-tab-btn').className = archived ? 'active' : '';
    renderNotes();
}

function filterNotes() {
    renderNotes();
}

function updateCategoryDropdown() {
    const select = document.getElementById('category-filter');
    const currentVal = select.value;
    const categories = [];

    notes.forEach(n => {
        if (n.category && !categories.includes(n.category.trim())) {
            categories.push(n.category.trim());
        }
    });

    select.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.innerText = cat;
        if (cat.toLowerCase() === currentVal.toLowerCase()) opt.selected = true;
        select.appendChild(opt);
    });
}

function escapeText(str) {
    if (!str) return '';
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
