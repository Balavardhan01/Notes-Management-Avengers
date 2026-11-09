// Personal Notes Management System - Vanilla JS
// Beginner-friendly hackathon code

// Detect backend URL (allows custom cloud backend or defaults to Spring Boot on localhost)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
let API_URL = localStorage.getItem('CUSTOM_BACKEND_URL') || (isLocalhost ? 'http://localhost:8080/api/notes' : '/api/notes');

let allNotes = [];
let currentTab = 'active'; // 'active' or 'archived'
let isDemoMode = false;

// Sample notes to show if running standalone/demo on Vercel without a live backend
const DEMO_SEED_NOTES = [
    {
        id: 1,
        title: "Hackathon Pitch Presentation",
        content: "Prepare slides for judges. Emphasize simple architecture, zero bloat, and fast H2 in-memory storage!",
        category: "Hackathon",
        important: true,
        archived: false
    },
    {
        id: 2,
        title: "Project Ideas & Brainstorming",
        content: "1. Notes manager\n2. Habit tracker\n3. Campus food delivery aggregator",
        category: "College",
        important: false,
        archived: false
    },
    {
        id: 3,
        title: "Weekend Grocery List",
        content: "- Instant ramen\n- Energy drinks\n- Coffee beans\n- Chips for midnight coding",
        category: "Personal",
        important: false,
        archived: false
    },
    {
        id: 4,
        title: "Old CS101 Lab 3 Submission",
        content: "Completed binary search tree assignment. Submitted to professor portal.",
        category: "College",
        important: false,
        archived: true
    }
];

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
    noteForm.addEventListener('submit', handleFormSubmit);
    cancelEditBtn.addEventListener('click', resetForm);
    tabActive.addEventListener('click', () => switchTab('active'));
    tabArchived.addEventListener('click', () => switchTab('archived'));
    searchInput.addEventListener('input', renderNotes);
    categoryFilterSelect.addEventListener('change', renderNotes);
}

// Fetch all notes from backend, or fallback to demo local storage if backend is unreachable
async function loadNotes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Backend returned status: ' + response.status);
        allNotes = await response.json();
        isDemoMode = false;
        showBackendStatus(true);
    } catch (error) {
        console.warn('Backend not reachable, activating Hackathon Demo Mode (LocalStorage):', error);
        isDemoMode = true;
        loadFromLocalStorage();
        showBackendStatus(false);
    }
    updateCategoryDropdown();
    renderNotes();
}

// Local storage fallback for hackathon demo on Vercel
function loadFromLocalStorage() {
    const saved = localStorage.getItem('HACKATHON_NOTES_DATA');
    if (saved) {
        try {
            allNotes = JSON.parse(saved);
        } catch (e) {
            allNotes = [...DEMO_SEED_NOTES];
        }
    } else {
        allNotes = [...DEMO_SEED_NOTES];
        saveToLocalStorage();
    }
}

function saveToLocalStorage() {
    localStorage.setItem('HACKATHON_NOTES_DATA', JSON.stringify(allNotes));
}

// Display small status banner showing if connected to Spring Boot or Demo Mode
function showBackendStatus(connected) {
    let banner = document.getElementById('backend-status-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'backend-status-banner';
        banner.style.textAlign = 'center';
        banner.style.padding = '8px 12px';
        banner.style.marginBottom = '16px';
        banner.style.borderRadius = '8px';
        banner.style.fontSize = '0.85rem';
        banner.style.fontWeight = '500';
        const header = document.querySelector('.app-header');
        if (header) header.insertAdjacentElement('afterend', banner);
    }

    if (connected) {
        banner.style.background = '#dcfce7';
        banner.style.color = '#15803d';
        banner.style.border = '1px solid #86efac';
        banner.innerHTML = `🟢 <strong>Connected to Spring Boot Backend</strong> (${API_URL})`;
    } else {
        banner.style.background = '#fef3c7';
        banner.style.color = '#92400e';
        banner.style.border = '1px solid #fcd34d';
        banner.innerHTML = `
            ⚡ <strong>Vercel Demo Mode Active</strong> (Backend not detected at <code>${API_URL}</code>).
            All notes, filters & edits are working interactively via browser storage!
            <a href="javascript:void(0)" onclick="promptBackendUrl()" style="margin-left: 8px; color: #4f46e5; text-decoration: underline;">Connect Backend URL</a>
        `;
    }
}

// Allow user to set a deployed backend URL (e.g. from Render or Railway)
window.promptBackendUrl = function() {
    const current = localStorage.getItem('CUSTOM_BACKEND_URL') || '';
    const newUrl = prompt('Enter your deployed Spring Boot API URL (e.g., https://my-backend.onrender.com/api/notes):', current);
    if (newUrl !== null) {
        if (newUrl.trim()) {
            localStorage.setItem('CUSTOM_BACKEND_URL', newUrl.trim());
            API_URL = newUrl.trim();
        } else {
            localStorage.removeItem('CUSTOM_BACKEND_URL');
            API_URL = isLocalhost ? 'http://localhost:8080/api/notes' : '/api/notes';
        }
        loadNotes();
    }
};

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

    const filtered = allNotes.filter(note => {
        const matchesTab = currentTab === 'active' ? !note.archived : note.archived;
        const matchesSearch = !searchQuery || (note.title && note.title.toLowerCase().includes(searchQuery));
        const matchesCategory = selectedCategory === 'ALL' || (note.category && note.category.toLowerCase() === selectedCategory.toLowerCase());
        return matchesTab && matchesSearch && matchesCategory;
    });

    const activeTotal = allNotes.filter(n => !n.archived).length;
    const archivedTotal = allNotes.filter(n => n.archived).length;
    activeCountBadge.textContent = activeTotal;
    archivedCountBadge.textContent = archivedTotal;

    filtered.sort((a, b) => {
        if (a.important === b.important) {
            return (b.id || 0) - (a.id || 0);
        }
        return a.important ? -1 : 1;
    });

    notesContainer.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.style.display = 'block';
        emptyState.innerHTML = currentTab === 'active'
            ? '<p>No active notes found. Create a new note above! 🚀</p>'
            : '<p>No archived notes here yet. 📦</p>';
    } else {
        emptyState.style.display = 'none';
        filtered.forEach(note => {
            notesContainer.appendChild(createNoteCardElement(note));
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
        archived: false
    };

    if (isDemoMode) {
        if (noteId) {
            const index = allNotes.findIndex(n => n.id == noteId);
            if (index !== -1) {
                noteData.id = Number(noteId);
                noteData.archived = allNotes[index].archived;
                allNotes[index] = noteData;
            }
        } else {
            noteData.id = Date.now();
            allNotes.push(noteData);
            currentTab = 'active';
            tabActive.classList.add('active');
            tabArchived.classList.remove('active');
        }
        saveToLocalStorage();
        resetForm();
        updateCategoryDropdown();
        renderNotes();
        return;
    }

    try {
        if (noteId) {
            const existing = allNotes.find(n => n.id == noteId);
            if (existing) noteData.archived = existing.archived;

            const response = await fetch(`${API_URL}/${noteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
            if (!response.ok) throw new Error('Failed to update note');
        } else {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteData)
            });
            if (!response.ok) throw new Error('Failed to create note');
            currentTab = 'active';
            tabActive.classList.add('active');
            tabArchived.classList.remove('active');
        }

        resetForm();
        await loadNotes();
    } catch (error) {
        console.error('Error saving note:', error);
        alert('Could not save note to backend.');
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

    if (isDemoMode) {
        note.important = !note.important;
        saveToLocalStorage();
        renderNotes();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...note, important: !note.important })
        });
        if (!response.ok) throw new Error('Failed to toggle importance');
        await loadNotes();
    } catch (error) {
        console.error('Error toggling importance:', error);
    }
};

// Toggle Archive status (Archive / Unarchive)
window.toggleArchive = async function(id) {
    const note = allNotes.find(n => n.id == id);
    if (!note) return;

    if (isDemoMode) {
        note.archived = !note.archived;
        saveToLocalStorage();
        renderNotes();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...note, archived: !note.archived })
        });
        if (!response.ok) throw new Error('Failed to toggle archive');
        await loadNotes();
    } catch (error) {
        console.error('Error toggling archive:', error);
    }
};

// Delete Note
window.deleteNote = async function(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    if (isDemoMode) {
        allNotes = allNotes.filter(n => n.id != id);
        saveToLocalStorage();
        updateCategoryDropdown();
        renderNotes();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete note');
        await loadNotes();
    } catch (error) {
        console.error('Error deleting note:', error);
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
