package com.coursett.cms.dto;

import java.util.Map;
import java.util.List;

public class AdminDashboardDTO {
    private Long totalStudents;
    private Long totalCourses;
    private Long totalEnrollments;
    private Map<String, Long> enrollmentsByStatus;
    private Long totalFaculty;
    private Long totalHOD;
    private Long pendingEnrollments;
    private Long lowAttendanceCount;
    private List<LowAttendanceAlertDTO> lowAttendanceAlerts;
    
    public AdminDashboardDTO() {}
    
    public AdminDashboardDTO(Long totalStudents, Long totalCourses, Long totalEnrollments,
                            Map<String, Long> enrollmentsByStatus, Long totalFaculty, Long totalHOD,
                            Long pendingEnrollments, Long lowAttendanceCount, List<LowAttendanceAlertDTO> lowAttendanceAlerts) {
        this.totalStudents = totalStudents;
        this.totalCourses = totalCourses;
        this.totalEnrollments = totalEnrollments;
        this.enrollmentsByStatus = enrollmentsByStatus;
        this.totalFaculty = totalFaculty;
        this.totalHOD = totalHOD;
        this.pendingEnrollments = pendingEnrollments;
        this.lowAttendanceCount = lowAttendanceCount;
        this.lowAttendanceAlerts = lowAttendanceAlerts;
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

    public Long getTotalHOD() {
        return totalHOD;
    }

    public void setTotalHOD(Long totalHOD) {
        this.totalHOD = totalHOD;
    }

    public Long getLowAttendanceCount() {
        return lowAttendanceCount;
    }

    public void setLowAttendanceCount(Long lowAttendanceCount) {
        this.lowAttendanceCount = lowAttendanceCount;
    }

    public List<LowAttendanceAlertDTO> getLowAttendanceAlerts() {
        return lowAttendanceAlerts;
    }

    public void setLowAttendanceAlerts(List<LowAttendanceAlertDTO> lowAttendanceAlerts) {
        this.lowAttendanceAlerts = lowAttendanceAlerts;
    }
}
