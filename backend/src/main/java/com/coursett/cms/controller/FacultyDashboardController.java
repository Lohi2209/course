package com.coursett.cms.controller;

import com.coursett.cms.dto.FacultyDashboardDTO;
import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Assignment;
import com.coursett.cms.model.Assessment;
import com.coursett.cms.model.EnrollmentStatus;
import com.coursett.cms.repository.AssignmentRepository;
import com.coursett.cms.repository.AssessmentRepository;
import com.coursett.cms.repository.AssessmentAttemptRepository;
import com.coursett.cms.repository.CourseRepository;
import com.coursett.cms.repository.EnrollmentRepository;
import com.coursett.cms.repository.SubmissionRepository;
import com.coursett.cms.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard/faculty")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184", "https://course-management-frontend-m277.onrender.com"})
public class FacultyDashboardController {
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private AssessmentRepository assessmentRepository;
    
    @Autowired
    private AssessmentAttemptRepository attemptRepository;
    
    @Autowired
    private AppUserRepository userRepository;
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<FacultyDashboardDTO> getFacultyStats(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser faculty = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        
        Long totalCourses = courseRepository.countByFacultyId(faculty.getId());
        
        // Count total enrolled students in all courses taught by this faculty
        Long totalStudents = enrollmentRepository.countByCourseFacultyIdAndStatus(faculty.getId(), EnrollmentStatus.APPROVED);
        
        // Get all assignments by this faculty
        List<Assignment> assignments = assignmentRepository.findByCreatedById(faculty.getId());
        
        // Count pending grading (assignments with ungraded submissions)
        Long pendingAssignmentGrading = assignments.stream()
            .mapToLong(assignment -> submissionRepository.countByAssignmentIdAndMarksObtainedIsNull(assignment.getId()))
            .sum();
        
        // Count pending grading for assessments
        List<Assessment> assessments = assessmentRepository.findByCreatedById(faculty.getId());
        Long pendingAssessmentGrading = assessments.stream()
            .mapToLong(assessment -> attemptRepository.countByAssessmentIdAndMarksObtainedIsNull(assessment.getId()))
            .sum();
        
        Long totalPendingGrading = pendingAssignmentGrading + pendingAssessmentGrading;
        
        // Get upcoming deadlines (next 7 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusDays(7);
        List<Assignment> upcomingDeadlines = assignments.stream()
            .filter(a -> a.getDueDate().isAfter(now) && a.getDueDate().isBefore(nextWeek))
            .sorted((a1, a2) -> a1.getDueDate().compareTo(a2.getDueDate()))
            .limit(5)
            .collect(Collectors.toList());
        
        FacultyDashboardDTO dto = new FacultyDashboardDTO(
            totalCourses,
            totalStudents,
            totalPendingGrading,
            upcomingDeadlines
        );
        
        return ResponseEntity.ok(dto);
    }
}
