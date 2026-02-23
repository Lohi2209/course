package com.coursett.cms.dto;

public class GradeDTO {
    private String courseName;
    private String assessmentTitle;
    private String assessmentType;
    private Double marksObtained;
    private Integer totalMarks;
    private Double percentage;
    private String grade;
    
    public GradeDTO() {}
    
    public GradeDTO(String courseName, String assessmentTitle, String assessmentType,
                    Double marksObtained, Integer totalMarks) {
        this.courseName = courseName;
        this.assessmentTitle = assessmentTitle;
        this.assessmentType = assessmentType;
        this.marksObtained = marksObtained;
        this.totalMarks = totalMarks;
        this.percentage = (marksObtained / totalMarks) * 100;
        this.grade = calculateGrade(percentage);
    }
    
    private String calculateGrade(Double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B+";
        if (percentage >= 60) return "B";
        if (percentage >= 50) return "C";
        if (percentage >= 40) return "D";
        return "F";
    }
    
    // Getters and Setters
    public String getCourseName() {
        return courseName;
    }
    
    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }
    
    public String getAssessmentTitle() {
        return assessmentTitle;
    }
    
    public void setAssessmentTitle(String assessmentTitle) {
        this.assessmentTitle = assessmentTitle;
    }
    
    public String getAssessmentType() {
        return assessmentType;
    }
    
    public void setAssessmentType(String assessmentType) {
        this.assessmentType = assessmentType;
    }
    
    public Double getMarksObtained() {
        return marksObtained;
    }
    
    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }
    
    public Integer getTotalMarks() {
        return totalMarks;
    }
    
    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
    
    public Double getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
    
    public String getGrade() {
        return grade;
    }
    
    public void setGrade(String grade) {
        this.grade = grade;
    }
}
