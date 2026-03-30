package com.coursett.cms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private AppUser student;
    
    @Column(name = "submission_text", length = 2000)
    private String submissionText;
    
    @Column(name = "file_url", length = 500)
    private String fileUrl;
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(name = "marks_obtained")
    private Integer marksObtained;

    @Column(name = "auto_graded")
    private Boolean autoGraded = false;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "graded_by")
    private AppUser gradedBy;
    
    @Column(length = 500)
    private String feedback;
    
    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Assignment getAssignment() {
        return assignment;
    }
    
    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }
    
    public AppUser getStudent() {
        return student;
    }
    
    public void setStudent(AppUser student) {
        this.student = student;
    }
    
    public String getSubmissionText() {
        return submissionText;
    }
    
    public void setSubmissionText(String submissionText) {
        this.submissionText = submissionText;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public Integer getMarksObtained() {
        return marksObtained;
    }
    
    public void setMarksObtained(Integer marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Boolean getAutoGraded() {
        return autoGraded;
    }

    public void setAutoGraded(Boolean autoGraded) {
        this.autoGraded = autoGraded;
    }
    
    public LocalDateTime getGradedAt() {
        return gradedAt;
    }
    
    public void setGradedAt(LocalDateTime gradedAt) {
        this.gradedAt = gradedAt;
    }
    
    public AppUser getGradedBy() {
        return gradedBy;
    }
    
    public void setGradedBy(AppUser gradedBy) {
        this.gradedBy = gradedBy;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}
