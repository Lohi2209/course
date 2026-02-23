package com.coursett.cms.dto;

import java.util.Map;

public class AdminDashboardDTO {
    private Long totalStudents;
    private Long totalCourses;
    private Long totalEnrollments;
    private Map<String, Long> enrollmentsByStatus;
    private Long totalFaculty;
    private Long pendingEnrollments;
    
    public AdminDashboardDTO() {}
    
    public AdminDashboardDTO(Long totalStudents, Long totalCourses, Long totalEnrollments, 
                            Map<String, Long> enrollmentsByStatus, Long totalFaculty, Long pendingEnrollments) {
        this.totalStudents = totalStudents;
        this.totalCourses = totalCourses;
        this.totalEnrollments = totalEnrollments;
        this.enrollmentsByStatus = enrollmentsByStatus;
        this.totalFaculty = totalFaculty;
        this.pendingEnrollments = pendingEnrollments;
    }
    
    // Getters and Setters
    public Long getTotalStudents() {
        return totalStudents;
    }
    
    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }
    
    public Long getTotalCourses() {
        return totalCourses;
    }
    
    public void setTotalCourses(Long totalCourses) {
        this.totalCourses = totalCourses;
    }
    
    public Long getTotalEnrollments() {
        return totalEnrollments;
    }
    
    public void setTotalEnrollments(Long totalEnrollments) {
        this.totalEnrollments = totalEnrollments;
    }
    
    public Map<String, Long> getEnrollmentsByStatus() {
        return enrollmentsByStatus;
    }
    
    public void setEnrollmentsByStatus(Map<String, Long> enrollmentsByStatus) {
        this.enrollmentsByStatus = enrollmentsByStatus;
    }
    
    public Long getTotalFaculty() {
        return totalFaculty;
    }
    
    public void setTotalFaculty(Long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }
    
    public Long getPendingEnrollments() {
        return pendingEnrollments;
    }
    
    public void setPendingEnrollments(Long pendingEnrollments) {
        this.pendingEnrollments = pendingEnrollments;
    }
}
