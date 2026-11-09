// Personal Notes Management System - Vanilla JS
// Beginner-friendly hackathon code

// Connect to Spring Boot backend API
const API_URL = window.location.origin.includes(':8080')
    ? '/api/notes'
    : 'http://localhost:8080/api/notes';

// In-memory state for fast rendering & filtering
let allNotes = [];
let currentTab = 'active'; // 'active' or 'archived'

// DOM Elements
const noteForm = document.getElementById('note-form');
const noteIdInput = document.getElementById('note-id');
const noteTitleInput = document.getElementById('note-title');
const noteCategoryInput = document.getElementById('note-category');
const noteContentInput = document.getElementById('note-content');
const noteImportantInput = document.getElementById('note-important');
const formHeading = document.getElementById('form-heading');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const tabActive = document.getElementById('tab-active');
const tabArchived = document.getElementById('tab-archived');
const activeCountBadge = document.getElementById('active-count');
const archivedCountBadge = document.getElementById('archived-count');

const searchInput = document.getElementById('search-input');
const categoryFilterSelect = document.getElementById('category-filter-select');
const notesContainer = document.getElementById('notes-container');
const emptyState = document.getElementById('empty-state');

// Initial load on page ready
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
});

// Setup UI Event Listeners
function setupEventListeners() {
    // Form submit for create/update
    noteForm.addEventListener('submit', handleFormSubmit);

    // Cancel edit
    cancelEditBtn.addEventListener('click', resetForm);

    // Tab switching
    tabActive.addEventListener('click', () => switchTab('active'));
    tabArchived.addEventListener('click', () => switchTab('archived'));

    // Search bar filter (real-time as student types)
    searchInput.addEventListener('input', renderNotes);

    // Category dropdown filter
    categoryFilterSelect.addEventListener('change', renderNotes);
}

// Fetch all notes from backend
async function loadNotes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch notes');
        allNotes = await response.json();
        updateCategoryDropdown();
        renderNotes();
    } catch (error) {
        console.error('Error fetching notes:', error);
        notesContainer.innerHTML = `
            <div class="empty-state" style="color: #ef4444; border-color: #fca5a5;">
                <p>⚠️ Cannot connect to Spring Boot backend (${API_URL}).</p>
                <p><small>Make sure the backend is running on port 8080!</small></p>
            </div>
        `;
    }
}

// Switch between "Active" and "Archived" tabs
function switchTab(tab) {
    currentTab = tab;
    if (tab === 'active') {
        tabActive.classList.add('active');
        tabArchived.classList.remove('active');
    } else {
        tabArchived.classList.add('active');
        tabActive.classList.remove('active');
    }
    renderNotes();
}

// Render notes based on current tab, search query, and category filter
function renderNotes() {
    const searchQuery = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilterSelect.value;

    // Filter notes
    const filtered = allNotes.filter(note => {
        // Tab check
        const matchesTab = currentTab === 'active' ? !note.archived : note.archived;

        // Search check (by title)
        const matchesSearch = !searchQuery || (note.title && note.title.toLowerCase().includes(searchQuery));

        // Category check
        const matchesCategory = selectedCategory === 'ALL' || (note.category && note.category.toLowerCase() === selectedCategory.toLowerCase());

        return matchesTab && matchesSearch && matchesCategory;
    });

    // Update counts on tab badges
    const activeTotal = allNotes.filter(n => !n.archived).length;
    const archivedTotal = allNotes.filter(n => n.archived).length;
    activeCountBadge.textContent = activeTotal;
    archivedCountBadge.textContent = archivedTotal;

    // Sort notes: Important ones first, then by ID descending
    filtered.sort((a, b) => {
        if (a.important === b.important) {
            return (b.id || 0) - (a.id || 0);
        }
        return a.important ? -1 : 1;
    });

    // Clear grid
    notesContainer.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = currentTab === 'active'
            ? '<p>No active notes found. Create a new note above! 🚀</p>'
            : '<p>No archived notes here yet. 📦</p>';
    } else {
        emptyState.style.display = 'none';
        filtered.forEach(note => {
            const card = createNoteCardElement(note);
            notesContainer.appendChild(card);
        });
    }
}

// Build HTML element for single note card
function createNoteCardElement(note) {
    const card = document.createElement('div');
    card.className = `note-card ${note.important ? 'is-important' : ''}`;

    const categoryText = note.category ? escapeHtml(note.category) : 'General';
    const importantBadge = note.important ? '<span class="badge-important">⭐ Important</span>' : '';
    const archiveBtnLabel = note.archived ? '🔄 Unarchive' : '📦 Archive';
    const starBtnLabel = note.important ? '★ Normal' : '⭐ Important';

    card.innerHTML = `
        <div>
            <div class="note-meta">
                <span class="badge-category">${categoryText}</span>
                ${importantBadge}
            </div>
            <h3>${escapeHtml(note.title)}</h3>
            <div class="note-body">${escapeHtml(note.content)}</div>
        </div>
        <div class="note-actions">
            <button class="btn btn-outline btn-sm" onclick="toggleImportant(${note.id})" title="Toggle Importance">
                ${starBtnLabel}
            </button>
            <button class="btn btn-outline btn-sm" onclick="startEdit(${note.id})" title="Edit Note">
                ✏️ Edit
            </button>
            <button class="btn btn-outline btn-sm" onclick="toggleArchive(${note.id})" title="${archiveBtnLabel}">
                ${archiveBtnLabel}
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteNote(${note.id})" title="Delete Note">
                🗑️ Delete
            </button>
        </div>
    `;

    return card;
}

// Handle Form Submission: Create OR Update
async function handleFormSubmit(e) {
    e.preventDefault();

    const noteId = noteIdInput.value;
    const noteData = {
        title: noteTitleInput.value.trim(),
        category: noteCategoryInput.value.trim() || 'General',
        content: noteContentInput.value.trim(),
        important: noteImportantInput.checked,
        archived: false // Default to active when creating
    };

    try {
        if (noteId) {
            // Update existing note
            const existing = allNotes.find(n => n.id == noteId);
            if (existing) {
                noteData.archived = existing.archived; // preserve archive status
            }

            const response = await fetch(`${API_URL}/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) throw new Error('Failed to update note');
        } else {
            // Create new note
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) throw new Error('Failed to create note');
            // If we created a note while looking at archived tab, switch to active
            currentTab = 'active';
            tabActive.classList.add('active');
            tabArchived.classList.remove('active');
        }

        resetForm();
        await loadNotes();
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Could not save note. Please check if the backend is running!');
    }
}

// Start Editing: Populate form with existing note
window.startEdit = function(id) {
    const note = allNotes.find(n => n.id == id);
    if (!note) return;

    noteIdInput.value = note.id;
    noteTitleInput.value = note.title;
    noteCategoryInput.value = note.category || '';
    noteContentInput.value = note.content;
    noteImportantInput.checked = note.important;

    formHeading.textContent = `✏️ Edit Note #${note.id}`;
    saveNoteBtn.textContent = 'Update Note';
    cancelEditBtn.style.display = 'inline-block';

    // Scroll smoothly to form
    noteForm.scrollIntoView({ behavior: 'smooth' });
};

// Reset Form back to "Create New Note" mode
function resetForm() {
    noteForm.reset();
    noteIdInput.value = '';
    formHeading.textContent = '➕ Create New Note';
    saveNoteBtn.textContent = 'Save Note';
    cancelEditBtn.style.display = 'none';
}

// Toggle Important status
window.toggleImportant = async function(id) {
    const note = allNotes.find(n => n.id == id);
    if (!note) return;

    const updatedNote = {
        ...note,
        important: !note.important
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedNote)
        });
        if (!response.ok) throw new Error('Failed to toggle importance');
        await loadNotes();
    } catch (error) {
        console.error('Error toggling importance:', error);
        alert('Could not update note importance.');
    }
};

// Toggle Archive status (Archive / Unarchive)
window.toggleArchive = async function(id) {
    const note = allNotes.find(n => n.id == id);
    if (!note) return;

    const updatedNote = {
        ...note,
        archived: !note.archived
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedNote)
        });
        if (!response.ok) throw new Error('Failed to toggle archive');
        await loadNotes();
    } catch (error) {
        console.error('Error toggling archive:', error);
        alert('Could not update archive status.');
    }
};

// Delete Note
window.deleteNote = async function(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete note');
        await loadNotes();
    } catch (error) {
        console.error('Error deleting note:', error);
        alert('Could not delete note.');
    }
};

// Dynamically populate Category Filter Dropdown from existing notes
function updateCategoryDropdown() {
    const currentVal = categoryFilterSelect.value;
    const categories = new Set(['College', 'Hackathon', 'Personal', 'Ideas', 'Work']);

    allNotes.forEach(note => {
        if (note.category && note.category.trim()) {
            categories.add(note.category.trim());
        }
    });

    categoryFilterSelect.innerHTML = '<option value="ALL">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat.toLowerCase() === currentVal.toLowerCase()) {
            option.selected = true;
        }
        categoryFilterSelect.appendChild(option);
    });
}

// Basic HTML escaping helper to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
