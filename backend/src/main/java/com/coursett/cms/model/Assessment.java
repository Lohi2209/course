package com.coursett.cms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "assessments")
public class Assessment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentType assessmentType;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;
    
    @Column(name = "passing_marks")
    private Integer passingMarks;
    
    @Column(name = "auto_grade", nullable = false)
    private Boolean autoGrade = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
    
    @OneToMany(mappedBy = "assessment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Question> questions = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public AssessmentType getAssessmentType() {
        return assessmentType;
    }
    
    public void setAssessmentType(AssessmentType assessmentType) {
        this.assessmentType = assessmentType;
    }
    
    public Course getCourse() {
        return course;
    }
    
    public void setCourse(Course course) {
        this.course = course;
    }
    
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public Integer getTotalMarks() {
        return totalMarks;
    }
    
    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
    
    public Integer getPassingMarks() {
        return passingMarks;
    }
    
    public void setPassingMarks(Integer passingMarks) {
        this.passingMarks = passingMarks;
    }
    
    public Boolean getAutoGrade() {
        return autoGrade;
    }
    
    public void setAutoGrade(Boolean autoGrade) {
        this.autoGrade = autoGrade;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public AppUser getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(AppUser createdBy) {
        this.createdBy = createdBy;
    }
    
    public Set<Question> getQuestions() {
        return questions;
    }
    
    public void setQuestions(Set<Question> questions) {
        this.questions = questions;
    }
}
