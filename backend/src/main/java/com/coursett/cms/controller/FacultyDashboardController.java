package com.coursett.cms.controller;

import com.coursett.cms.dto.FacultyDashboardDTO;
import com.coursett.cms.dto.LowAttendanceAlertDTO;
import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Assignment;
import com.coursett.cms.model.Assessment;
import com.coursett.cms.model.AttendanceStatus;
import com.coursett.cms.model.Enrollment;
import com.coursett.cms.model.EnrollmentStatus;
import com.coursett.cms.repository.AttendanceRecordRepository;
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
import java.util.ArrayList;
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

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    
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

        List<LowAttendanceAlertDTO> lowAttendanceAlerts = buildLowAttendanceAlertsForFaculty(faculty.getId());
        
        FacultyDashboardDTO dto = new FacultyDashboardDTO(
            totalCourses,
            totalStudents,
            totalPendingGrading,
            upcomingDeadlines,
            (long) lowAttendanceAlerts.size(),
            lowAttendanceAlerts
        );
        
        return ResponseEntity.ok(dto);
    }

    private List<LowAttendanceAlertDTO> buildLowAttendanceAlertsForFaculty(Long facultyId) {
        List<Enrollment> approvedEnrollments = enrollmentRepository.findByStatus(EnrollmentStatus.APPROVED)
                .stream()
                .filter(enrollment -> enrollment.getCourse().getFaculty() != null
                        && facultyId.equals(enrollment.getCourse().getFaculty().getId()))
                .collect(Collectors.toList());

        List<LowAttendanceAlertDTO> alerts = new ArrayList<>();

        for (Enrollment enrollment : approvedEnrollments) {
            Long courseId = enrollment.getCourse().getId();
            Long studentId = enrollment.getStudent().getId();

            long totalClasses = attendanceRecordRepository.countByCourseIdAndStudentId(courseId, studentId);
            if (totalClasses <= 0) {
                continue;
            }

            long present = attendanceRecordRepository.countByCourseIdAndStudentIdAndStatus(courseId, studentId, AttendanceStatus.PRESENT);
            long late = attendanceRecordRepository.countByCourseIdAndStudentIdAndStatus(courseId, studentId, AttendanceStatus.LATE);
            double percentage = Math.round(((present + late) * 10000.0 / totalClasses)) / 100.0;

            if (percentage < 75.0) {
                LowAttendanceAlertDTO alert = new LowAttendanceAlertDTO();
                alert.setCourseId(courseId);
                alert.setCourseName(enrollment.getCourse().getCourseName());
                alert.setStudentId(studentId);
                alert.setStudentName(enrollment.getStudent().getFullName());
                alert.setAttendancePercentage(percentage);
                alert.setTotalClasses(totalClasses);
                alerts.add(alert);
            }
        }

        return alerts.stream()
                .sorted((a, b) -> Double.compare(a.getAttendancePercentage(), b.getAttendancePercentage()))
                .limit(20)
                .collect(Collectors.toList());
    }
}
