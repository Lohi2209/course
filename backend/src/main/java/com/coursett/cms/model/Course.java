package com.coursett.cms.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "courses")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Course code is required")
    @Size(max = 20, message = "Course code cannot exceed 20 characters")
    @Column(nullable = false, unique = true, length = 20)
    private String courseCode;

    @NotBlank(message = "Course name is required")
    @Size(max = 120, message = "Course name cannot exceed 120 characters")
    @Column(nullable = false, length = 120)
    private String courseName;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Column(length = 500)
    private String description;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1")
    @Column(nullable = false)
    private Integer durationInWeeks;

    // Faculty Assignment
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id")
    private AppUser faculty;

    // Course Prerequisites
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_prerequisites",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "prerequisite_id")
    )
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Set<Course> prerequisites = new HashSet<>();

    // Course Scheduling
    @Column(length = 50)
    private String semester; // e.g., "Fall 2026", "Spring 2027"

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(length = 100)
    private String meetingDays; // e.g., "Mon, Wed, Fri"

    @Column(length = 50)
    private String meetingTime; // e.g., "10:00 AM - 11:30 AM"

    public Course() {
    }

    public Course(Long id, String courseCode, String courseName, String description, Integer durationInWeeks) {
        this.id = id;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.description = description;
        this.durationInWeeks = durationInWeeks;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDurationInWeeks() {
        return durationInWeeks;
    }

    public void setDurationInWeeks(Integer durationInWeeks) {
        this.durationInWeeks = durationInWeeks;
    }

    public AppUser getFaculty() {
        return faculty;
    }

    public void setFaculty(AppUser faculty) {
        this.faculty = faculty;
    }

    public Set<Course> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(Set<Course> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getMeetingDays() {
        return meetingDays;
    }

    public void setMeetingDays(String meetingDays) {
        this.meetingDays = meetingDays;
    }

    public String getMeetingTime() {
        return meetingTime;
    }

    public void setMeetingTime(String meetingTime) {
        this.meetingTime = meetingTime;
    }
}
