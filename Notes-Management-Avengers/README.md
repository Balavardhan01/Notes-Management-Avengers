# 📝 Personal Notes Management System (Hackathon Edition)

A simple, beginner-friendly full-stack Personal Notes Management System built for a college hackathon.

---

## 🚀 Tech Stack

- **Backend**: Java 17+ with **Spring Boot 3**
- **Database**: **H2 in-memory database** (zero installation required)
- **Frontend**: Plain **HTML5**, **CSS3**, and **Vanilla JavaScript** (using modern `fetch` API)
- **Architecture**: Single `Note` entity, single `NoteRepository`, single `NoteController` — clean, fast, and no unnecessary enterprise overhead!

---

## ✨ Features Implemented

1. **Full CRUD for Notes**:
   - Create new notes with title, content, category, and importance.
   - View notes in a responsive card grid.
   - Edit notes with automatic pre-population in the form.
   - Delete notes with one click.
2. **Organization by Category**:
   - Assign categories (e.g., `College`, `Hackathon`, `Personal`, `Ideas`).
   - Dynamic category filter dropdown.
3. **Importance Flagging**:
   - Mark notes as **Important** (⭐) or **Normal**.
   - Important notes display a highlight banner and are sorted to the top.
4. **Archive Management**:
   - Archive notes to keep your workspace decluttered.
   - Dedicated **Active Notes** and **Archived Notes** tabs with real-time count badges.
   - Toggle notes between active and archived states instantly.
5. **Real-Time Search**:
   - Instant search bar that filters notes by title as you type.

---

## 📁 Project Structure

```text
Notes-Management-Avengers/
├── pom.xml                               # Maven project dependencies (Spring Boot, JPA, H2)
├── README.md                             # Documentation & run instructions
├── src/
│   └── main/
│       ├── java/
│       │   └── com/hackathon/notes/
│       │       ├── Note.java             # Single JPA Entity
│       │       ├── NoteRepository.java   # Single JpaRepository interface
│       │       ├── NoteController.java   # Single REST Controller (CRUD API)
│       │       └── NotesApplication.java  # Main class + sample data seed
│       └── resources/
│           ├── application.properties    # H2 DB & server configuration
│           └── static/                   # Served directly by Spring Boot
│               ├── index.html            # Main HTML UI
│               ├── style.css             # CSS styling & badges
│               └── app.js                # Vanilla JS logic & fetch API
└── frontend/                             # Standalone copy of frontend files
    ├── index.html
    ├── style.css
    └── app.js
```

---

## 🏃 How to Run the Application

### Option A: Run Using Your Favorite Java IDE (IntelliJ IDEA / Eclipse / VS Code) — *Recommended for College Demos*

1. Open **IntelliJ IDEA**, **Eclipse**, or **VS Code**.
2. Click **Open Folder / Open Project** and select this folder (`Notes-Management-Avengers`).
3. Allow the IDE to import the `pom.xml`.
4. Navigate to `src/main/java/com/hackathon/notes/NotesApplication.java`.
5. Right-click and choose **Run 'NotesApplication'** (or press the green Play button).
6. Open your browser and visit:
   - **Frontend App**: [http://localhost:8080](http://localhost:8080)
   - **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:notesdb`, Username: `sa`, Password: *leave blank*)

---

### Option B: Run Using Maven from the Terminal

If you have Maven installed:

```bash
mvn spring-boot:run
```

Then open [http://localhost:8080](http://localhost:8080) in your web browser.

---

### Option C: Running the Frontend Standalone

Because `@CrossOrigin(origins = "*")` is enabled in `NoteController`, you can also open `frontend/index.html` directly in your browser or run it with VS Code's **Live Server** extension while the Spring Boot backend is running on port 8080.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | Get all notes |
| `GET` | `/api/notes/{id}` | Get a single note by ID |
| `POST` | `/api/notes` | Create a new note |
| `PUT` | `/api/notes/{id}` | Update an existing note |
| `DELETE`| `/api/notes/{id}` | Delete a note by ID |
