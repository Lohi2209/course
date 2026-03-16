package com.coursett.cms.dto;

import com.coursett.cms.model.Assignment;
import java.util.List;

public class FacultyDashboardDTO {
    private Long totalCourses;
    private Long totalStudents;
    private Long pendingSubmissions;
    private List<Assignment> upcomingDeadlines;
    private Long lowAttendanceCount;
    private List<LowAttendanceAlertDTO> lowAttendanceAlerts;
    
    public FacultyDashboardDTO() {}
    
    public FacultyDashboardDTO(Long totalCourses, Long totalStudents, Long pendingSubmissions,
                               List<Assignment> upcomingDeadlines, Long lowAttendanceCount,
                               List<LowAttendanceAlertDTO> lowAttendanceAlerts) {
        this.totalCourses = totalCourses;
        this.totalStudents = totalStudents;
        this.pendingSubmissions = pendingSubmissions;
        this.upcomingDeadlines = upcomingDeadlines;
        this.lowAttendanceCount = lowAttendanceCount;
        this.lowAttendanceAlerts = lowAttendanceAlerts;
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
