package com.coursett.cms.dto;

import com.coursett.cms.model.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public class AttendanceEntryRequest {

    @NotNull
    private Long studentId;

    @NotNull
    private AttendanceStatus status;

    private String remarks;

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
