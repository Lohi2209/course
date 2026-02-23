package com.coursett.cms.dto;

import java.time.LocalDateTime;

public class MaterialResponse {
    private Long id;
    private String title;
    private String description;
    private String materialType;
    private String url;
    private String error;
    private String uploadedBy;
    private LocalDateTime uploadedAt;

    public MaterialResponse() {
    }

    public MaterialResponse(Long id, String title, String description, String materialType, 
                          String url, String error, String uploadedBy, LocalDateTime uploadedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.materialType = materialType;
        this.url = url;
        this.error = error;
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

    public String getMaterialType() {
        return materialType;
    }

    public void setMaterialType(String materialType) {
        this.materialType = materialType;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
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
