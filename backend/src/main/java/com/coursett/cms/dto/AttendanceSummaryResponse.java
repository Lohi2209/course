package com.coursett.cms.dto;

public class AttendanceSummaryResponse {

    private Long courseId;
    private String courseName;
    private long totalClasses;
    private long presentClasses;
    private long lateClasses;
    private double attendancePercentage;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public long getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(long totalClasses) {
        this.totalClasses = totalClasses;
    }

    public long getPresentClasses() {
        return presentClasses;
    }

    public void setPresentClasses(long presentClasses) {
        this.presentClasses = presentClasses;
    }

    public long getLateClasses() {
        return lateClasses;
    }

    public void setLateClasses(long lateClasses) {
        this.lateClasses = lateClasses;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }
}
