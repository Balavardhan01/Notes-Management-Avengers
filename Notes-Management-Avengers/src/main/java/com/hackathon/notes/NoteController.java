package com.hackathon.notes;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*") // Allow frontend to call APIs without CORS issues
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    // Get all notes
    @GetMapping
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    // Get single note by ID
    @GetMapping("/{id}")
    public Note getNoteById(@PathVariable Long id) {
        return noteRepository.findById(id).orElse(null);
    }

    // Create a new note
    @PostMapping
    public Note createNote(@RequestBody Note note) {
        return noteRepository.save(note);
    }

    // Update an existing note
    @PutMapping("/{id}")
    public Note updateNote(@PathVariable Long id, @RequestBody Note updatedNote) {
        Note note = noteRepository.findById(id).orElse(null);
        if (note != null) {
            note.setTitle(updatedNote.getTitle());
            note.setContent(updatedNote.getContent());
            note.setCategory(updatedNote.getCategory());
            note.setImportant(updatedNote.isImportant());
            note.setArchived(updatedNote.isArchived());
            return noteRepository.save(note);
        }
        return null;
    }

    // Delete a note
    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteRepository.deleteById(id);
    }
}
