package com.hackathon.notes;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class NotesApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotesApplication.class, args);
        System.out.println("==================================================");
        System.out.println("  Personal Notes Management System is Running!   ");
        System.out.println("  Open Frontend: http://localhost:8080            ");
        System.out.println("  H2 DB Console: http://localhost:8080/h2-console ");
        System.out.println("==================================================");
    }

    // Seed some initial notes for the hackathon demo so the UI isn't blank
    @Bean
    public CommandLineRunner loadSampleData(NoteRepository noteRepository) {
        return args -> {
            noteRepository.save(new Note(
                "Hackathon Pitch Presentation",
                "Prepare slides for judges. Emphasize simple architecture, zero bloat, and fast H2 in-memory storage!",
                "Hackathon",
                true,
                false
            ));

            noteRepository.save(new Note(
                "Project Ideas & Brainstorming",
                "1. Notes manager\n2. Habit tracker\n3. Campus food delivery aggregator",
                "College",
                false,
                false
            ));

            noteRepository.save(new Note(
                "Weekend Grocery List",
                "- Instant ramen\n- Energy drinks\n- Coffee beans\n- Chips for midnight coding",
                "Personal",
                false,
                false
            ));

            noteRepository.save(new Note(
                "Old CS101 Lab 3 Submission",
                "Completed binary search tree assignment. Submitted to professor portal.",
                "College",
                false,
                true // Archived note example
            ));
        };
    }
}
