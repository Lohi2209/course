package com.coursett.cms.dto;

import com.coursett.cms.model.Assignment;
import java.util.List;

public class FacultyDashboardDTO {
    private Long totalCourses;
    private Long totalStudents;
    private Long pendingSubmissions;
    private List<Assignment> upcomingDeadlines;
    
    public FacultyDashboardDTO() {}
    
    public FacultyDashboardDTO(Long totalCourses, Long totalStudents, Long pendingSubmissions, List<Assignment> upcomingDeadlines) {
        this.totalCourses = totalCourses;
        this.totalStudents = totalStudents;
        this.pendingSubmissions = pendingSubmissions;
        this.upcomingDeadlines = upcomingDeadlines;
    }
    
    // Getters and Setters
    public Long getTotalCourses() {
        return totalCourses;
    }
    
    public void setTotalCourses(Long totalCourses) {
        this.totalCourses = totalCourses;
    }
    
    public Long getTotalStudents() {
        return totalStudents;
    }
    
    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }
    
    public Long getPendingSubmissions() {
        return pendingSubmissions;
    }
    
    public void setPendingSubmissions(Long pendingSubmissions) {
        this.pendingSubmissions = pendingSubmissions;
    }
    
    public List<Assignment> getUpcomingDeadlines() {
        return upcomingDeadlines;
    }
    
    public void setUpcomingDeadlines(List<Assignment> upcomingDeadlines) {
        this.upcomingDeadlines = upcomingDeadlines;
    }
}
