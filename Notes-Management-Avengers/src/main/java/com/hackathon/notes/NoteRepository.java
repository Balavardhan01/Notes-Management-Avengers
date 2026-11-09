package com.hackathon.notes;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    // Basic helper methods if needed
    List<Note> findByArchived(boolean archived);
    List<Note> findByCategory(String category);
}
