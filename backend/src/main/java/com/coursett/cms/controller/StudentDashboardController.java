package com.coursett.cms.controller;

import com.coursett.cms.dto.StudentDashboardDTO;
import com.coursett.cms.model.*;
import com.coursett.cms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/student")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184"})
public class StudentDashboardController {
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private AppUserRepository userRepository;
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDashboardDTO> getStudentStats(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Get enrolled courses
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.APPROVED);
        List<Course> enrolledCourses = enrollments.stream()
            .map(Enrollment::getCourse)
            .collect(Collectors.toList());
        
        // Get assignments for enrolled courses
        List<Assignment> allAssignments = new ArrayList<>();
        for (Course course : enrolledCourses) {
            allAssignments.addAll(assignmentRepository.findByCourseId(course.getId()));
        }
        
        // Get upcoming deadlines (next 7 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusDays(7);
        List<Assignment> upcomingDeadlines = allAssignments.stream()
            .filter(a -> a.getDueDate().isAfter(now) && a.getDueDate().isBefore(nextWeek))
            .sorted((a1, a2) -> a1.getDueDate().compareTo(a2.getDueDate()))
            .limit(5)
            .collect(Collectors.toList());
        
        // Count pending submissions (assignments with no submission)
        List<Submission> mySubmissions = submissionRepository.findByStudentId(student.getId());
        Long submissionsPending = allAssignments.stream()
            .filter(assignment -> mySubmissions.stream()
                .noneMatch(submission -> submission.getAssignment().getId().equals(assignment.getId())))
            .count();
        
        StudentDashboardDTO dto = new StudentDashboardDTO(
            enrolledCourses,
            upcomingDeadlines,
            submissionsPending
        );
        
        return ResponseEntity.ok(dto);
    }
}
