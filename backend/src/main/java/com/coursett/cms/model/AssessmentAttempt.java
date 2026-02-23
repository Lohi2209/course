package com.coursett.cms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "assessment_attempts")
public class AssessmentAttempt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private AppUser student;
    
    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @ElementCollection
    @CollectionTable(name = "attempt_answers", joinColumns = @JoinColumn(name = "attempt_id"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "answer", length = 2000)
    private Map<Long, String> answers = new HashMap<>();
    
    @Column(name = "marks_obtained")
    private Double marksObtained;
    
    @Column(name = "auto_graded")
    private Boolean autoGraded = false;
    
    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "graded_by")
    private AppUser gradedBy;
    
    @Column(length = 1000)
    private String feedback;
    
    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Assessment getAssessment() {
        return assessment;
    }
    
    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }
    
    public AppUser getStudent() {
        return student;
    }
    
    public void setStudent(AppUser student) {
        this.student = student;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public Map<Long, String> getAnswers() {
        return answers;
    }
    
    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
    
    public Double getMarksObtained() {
        return marksObtained;
    }
    
    public void setMarksObtained(Double marksObtained) {
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
