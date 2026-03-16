package com.coursett.cms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class AttendanceMarkRequest {

    @NotNull
    private Long courseId;

    @NotNull
    private LocalDate attendanceDate;

    @Valid
    @NotEmpty
    private List<AttendanceEntryRequest> records;

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public List<AttendanceEntryRequest> getRecords() {
        return records;
    }

    public void setRecords(List<AttendanceEntryRequest> records) {
        this.records = records;
    }
}
