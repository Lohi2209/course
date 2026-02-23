package com.coursett.cms.dto;

import jakarta.validation.constraints.NotNull;

public class EnrollmentRequest {
    
    @NotNull(message = "Course ID is required")
    private Long courseId;
    
    private String notes;
    
    // Getters and Setters
    public Long getCourseId() {
        return courseId;
    }
    
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
