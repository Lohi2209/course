package com.coursett.cms.model;

public enum EnrollmentStatus {
    PENDING,      // Student submitted registration, awaiting approval
    APPROVED,     // Enrollment approved by faculty/admin
    REJECTED,     // Enrollment rejected
    DROPPED       // Student dropped the course
}
