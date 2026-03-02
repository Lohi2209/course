package com.coursett.cms.controller;

import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Course;
import com.coursett.cms.model.Enrollment;
import com.coursett.cms.model.EnrollmentStatus;
import com.coursett.cms.repository.AppUserRepository;
import com.coursett.cms.repository.EnrollmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184", "https://course-management-frontend-m277.onrender.com"})
public class StudentCourseController {
    
    private final EnrollmentRepository enrollmentRepository;
    private final AppUserRepository userRepository;
    
    public StudentCourseController(EnrollmentRepository enrollmentRepository,
                                   AppUserRepository userRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }
    
    // Get only courses the student is enrolled in (approved)
    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Course>> getMyEnrolledCourses(
            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Get only approved enrollments
        List<Enrollment> approvedEnrollments = enrollmentRepository
                .findByStudentIdAndStatus(student.getId(), EnrollmentStatus.APPROVED);
        
        // Get the courses from approved enrollments
        List<Course> enrolledCourses = approvedEnrollments.stream()
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(enrolledCourses);
    }
}
