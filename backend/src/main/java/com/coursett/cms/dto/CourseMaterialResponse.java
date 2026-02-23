package com.coursett.cms.dto;

import com.coursett.cms.model.MaterialType;

import java.time.LocalDateTime;

public class CourseMaterialResponse {

    private Long id;
    private String title;
    private String description;
    private MaterialType materialType;
    private String url;
    private Long courseId;
    private String courseName;
    private String uploadedBy;
    private LocalDateTime uploadedAt;

    public CourseMaterialResponse() {
    }

    public CourseMaterialResponse(Long id, String title, String description, MaterialType materialType, 
                                   String url, Long courseId, String courseName, String uploadedBy, LocalDateTime uploadedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.materialType = materialType;
        this.url = url;
        this.courseId = courseId;
        this.courseName = courseName;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
    }

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

    public MaterialType getMaterialType() {
        return materialType;
    }

    public void setMaterialType(MaterialType materialType) {
        this.materialType = materialType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

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

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
