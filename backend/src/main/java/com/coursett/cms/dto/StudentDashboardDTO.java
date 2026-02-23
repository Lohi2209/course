package com.coursett.cms.dto;

import com.coursett.cms.model.Assignment;
import com.coursett.cms.model.Course;
import java.util.List;

public class StudentDashboardDTO {
    private List<Course> enrolledCourses;
    private List<Assignment> upcomingDeadlines;
    private Long submissionsPending;
    private Double averageGrade;
    
    public StudentDashboardDTO() {}
    
    public StudentDashboardDTO(List<Course> enrolledCourses, List<Assignment> upcomingDeadlines, 
                              Long submissionsPending) {
        this.enrolledCourses = enrolledCourses;
        this.upcomingDeadlines = upcomingDeadlines;
        this.submissionsPending = submissionsPending;
        this.averageGrade = 0.0;
    }
    
    // Getters and Setters
    public List<Course> getEnrolledCourses() {
        return enrolledCourses;
    }
    
    public void setEnrolledCourses(List<Course> enrolledCourses) {
        this.enrolledCourses = enrolledCourses;
    }
    
    public List<Assignment> getUpcomingDeadlines() {
        return upcomingDeadlines;
    }
    
    public void setUpcomingDeadlines(List<Assignment> upcomingDeadlines) {
        this.upcomingDeadlines = upcomingDeadlines;
    }
    
    public Long getSubmissionsPending() {
        return submissionsPending;
    }
    
    public void setSubmissionsPending(Long submissionsPending) {
        this.submissionsPending = submissionsPending;
    }
    
    public Double getAverageGrade() {
        return averageGrade;
    }
    
    public void setAverageGrade(Double averageGrade) {
        this.averageGrade = averageGrade;
    }
}
