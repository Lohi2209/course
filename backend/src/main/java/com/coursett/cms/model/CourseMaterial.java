package com.coursett.cms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "course_materials")
public class CourseMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Material title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    @Column(nullable = false, length = 200)
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;

    @NotNull(message = "Material type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MaterialType materialType;

    @NotBlank(message = "URL or file path is required")
    @Size(max = 500, message = "URL cannot exceed 500 characters")
    @Column(nullable = false, length = 500)
    private String url;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by")
    private AppUser uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    public CourseMaterial() {
    }

    public CourseMaterial(String title, String description, MaterialType materialType, String url, Course course, AppUser uploadedBy) {
        this.title = title;
        this.description = description;
        this.materialType = materialType;
        this.url = url;
        this.course = course;
        this.uploadedBy = uploadedBy;
        this.uploadedAt = LocalDateTime.now();
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

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public AppUser getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(AppUser uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
