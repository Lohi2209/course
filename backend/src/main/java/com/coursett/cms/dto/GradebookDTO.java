package com.coursett.cms.dto;

import java.util.List;
import java.util.Map;

public class GradebookDTO {
    private String studentName;
    private String courseName;
    private List<GradeDTO> grades;
    private Double overallAverage;
    private String overallGrade;
    private Map<String, Long> gradeDistribution;
    
    public GradebookDTO() {}
    
    // Getters and Setters
    public String getStudentName() {
        return studentName;
    }
    
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    
    public String getCourseName() {
        return courseName;
    }
    
    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }
    
    public List<GradeDTO> getGrades() {
        return grades;
    }
    
    public void setGrades(List<GradeDTO> grades) {
        this.grades = grades;
    }
    
    public Double getOverallAverage() {
        return overallAverage;
    }
    
    public void setOverallAverage(Double overallAverage) {
        this.overallAverage = overallAverage;
    }
    
    public String getOverallGrade() {
        return overallGrade;
    }
    
    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
    }
    
    public Map<String, Long> getGradeDistribution() {
        return gradeDistribution;
    }
    
    public void setGradeDistribution(Map<String, Long> gradeDistribution) {
        this.gradeDistribution = gradeDistribution;
    }
}
