package com.coursett.cms.controller;

import com.coursett.cms.dto.EnrollmentRequest;
import com.coursett.cms.dto.EnrollmentResponse;
import com.coursett.cms.model.*;
import com.coursett.cms.repository.CourseRepository;
import com.coursett.cms.repository.EnrollmentRepository;
import com.coursett.cms.repository.AppUserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184"})
public class EnrollmentController {
    
    private final EnrollmentRepository enrollmentRepository;
    private final AppUserRepository userRepository;
    private final CourseRepository courseRepository;
    
    public EnrollmentController(EnrollmentRepository enrollmentRepository, 
                               AppUserRepository userRepository,
                               CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }
    
    // Student registers for a course
    @PostMapping("/register")
    @PreAuthorize("hasRole('STUDENT')")
    @SuppressWarnings("null")
    public ResponseEntity<?> registerForCourse(@Valid @RequestBody EnrollmentRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Check if already enrolled
        Optional<Enrollment> existing = enrollmentRepository.findByStudentIdAndCourseId(
                student.getId(), course.getId());
        
        if (existing.isPresent()) {
            EnrollmentStatus status = existing.get().getStatus();
            if (status == EnrollmentStatus.PENDING || status == EnrollmentStatus.APPROVED) {
                return ResponseEntity.badRequest()
                        .body("Already enrolled or pending approval for this course");
            }
        }
        
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.PENDING);
        enrollment.setNotes(request.getNotes());
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }
    
    // Get student's enrollments
    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(
            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        List<EnrollmentResponse> responses = enrollments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    // Get all pending enrollments (for faculty/admin)
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<List<EnrollmentResponse>> getPendingEnrollments() {
        List<Enrollment> enrollments = enrollmentRepository.findByStatus(EnrollmentStatus.PENDING);
        List<EnrollmentResponse> responses = enrollments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    // Get all enrollments (for admin/HOD)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<EnrollmentResponse>> getAllEnrollments() {
        List<Enrollment> enrollments = enrollmentRepository.findAll();
        List<EnrollmentResponse> responses = enrollments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    // Get enrollments for a specific course
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        List<EnrollmentResponse> responses = enrollments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
    
    // Approve enrollment
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> approveEnrollment(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        if (enrollment.getStatus() != EnrollmentStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body("Only pending enrollments can be approved");
        }
        
        AppUser approver = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollment.setApprovalDate(LocalDateTime.now());
        enrollment.setApprovedBy(approver);
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(mapToResponse(saved));
    }
    
    // Reject enrollment
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> rejectEnrollment(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        if (enrollment.getStatus() != EnrollmentStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body("Only pending enrollments can be rejected");
        }
        
        AppUser approver = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        enrollment.setStatus(EnrollmentStatus.REJECTED);
        enrollment.setApprovalDate(LocalDateTime.now());
        enrollment.setApprovedBy(approver);
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(mapToResponse(saved));
    }
    
    // Drop course (by student)
    @PutMapping("/{id}/drop")
    @PreAuthorize("hasRole('STUDENT')")
    @SuppressWarnings("null")
    public ResponseEntity<?> dropCourse(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Verify this enrollment belongs to the student
        if (!enrollment.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only drop your own enrollments");
        }
        
        if (enrollment.getStatus() != EnrollmentStatus.APPROVED && 
            enrollment.getStatus() != EnrollmentStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body("Only approved or pending enrollments can be dropped");
        }
        
        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollment.setApprovalDate(LocalDateTime.now());
        
        Enrollment saved = enrollmentRepository.save(enrollment);
        return ResponseEntity.ok(mapToResponse(saved));
    }
    
    // Helper method to map Enrollment to Response
    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        EnrollmentResponse response = new EnrollmentResponse();
        response.setId(enrollment.getId());
        response.setStudentId(enrollment.getStudent().getId());
        response.setStudentName(enrollment.getStudent().getFullName());
        response.setStudentEmail(enrollment.getStudent().getEmail());
        response.setCourseId(enrollment.getCourse().getId());
        response.setCourseCode(enrollment.getCourse().getCourseCode());
        response.setCourseName(enrollment.getCourse().getCourseName());
        response.setStatus(enrollment.getStatus());
        response.setRequestDate(enrollment.getRequestDate());
        response.setApprovalDate(enrollment.getApprovalDate());
        
        if (enrollment.getApprovedBy() != null) {
            response.setApprovedByName(enrollment.getApprovedBy().getFullName());
        }
        
        response.setNotes(enrollment.getNotes());
        return response;
    }
}
