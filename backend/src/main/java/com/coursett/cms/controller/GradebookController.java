package com.coursett.cms.controller;

import com.coursett.cms.dto.GradeDTO;
import com.coursett.cms.dto.GradebookDTO;
import com.coursett.cms.model.*;
import com.coursett.cms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gradebook")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184"})
public class GradebookController {
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private AssessmentAttemptRepository attemptRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private AssessmentRepository assessmentRepository;
    
    @Autowired
    private AppUserRepository userRepository;
    
    @GetMapping("/student/my-grades")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<GradebookDTO> getMyGrades(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        GradebookDTO gradebook = new GradebookDTO();
        gradebook.setStudentName(student.getFullName());
        
        List<GradeDTO> allGrades = new ArrayList<>();
        
        // Get all enrolled courses
        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.APPROVED);
        
        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            
            // Get assignment submissions
            List<Assignment> assignments = assignmentRepository.findByCourseId(course.getId());
            for (Assignment assignment : assignments) {
                submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId())
                    .ifPresent(submission -> {
                        if (submission.getMarksObtained() != null) {
                            GradeDTO grade = new GradeDTO(
                                course.getCourseName(),
                                assignment.getTitle(),
                                "ASSIGNMENT",
                                submission.getMarksObtained().doubleValue(),
                                assignment.getMaxMarks()
                            );
                            allGrades.add(grade);
                        }
                    });
            }
            
            // Get assessment attempts
            List<Assessment> assessments = assessmentRepository.findByCourseId(course.getId());
            for (Assessment assessment : assessments) {
                attemptRepository.findByAssessmentIdAndStudentId(assessment.getId(), student.getId())
                    .ifPresent(attempt -> {
                        if (attempt.getMarksObtained() != null) {
                            GradeDTO grade = new GradeDTO(
                                course.getCourseName(),
                                assessment.getTitle(),
                                assessment.getAssessmentType().toString(),
                                attempt.getMarksObtained(),
                                assessment.getTotalMarks()
                            );
                            allGrades.add(grade);
                        }
                    });
            }
        }
        
        gradebook.setGrades(allGrades);
        
        // Calculate overall average
        if (!allGrades.isEmpty()) {
            double avgPercentage = allGrades.stream()
                .mapToDouble(GradeDTO::getPercentage)
                .average()
                .orElse(0.0);
            gradebook.setOverallAverage(avgPercentage);
            gradebook.setOverallGrade(calculateGrade(avgPercentage));
        } else {
            gradebook.setOverallAverage(0.0);
            gradebook.setOverallGrade("N/A");
        }
        
        // Grade distribution
        Map<String, Long> distribution = allGrades.stream()
            .collect(Collectors.groupingBy(GradeDTO::getGrade, Collectors.counting()));
        gradebook.setGradeDistribution(distribution);
        
        return ResponseEntity.ok(gradebook);
    }
    
    @GetMapping("/course/{courseId}/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<GradebookDTO> getStudentGradesForCourse(@PathVariable Long courseId, @PathVariable Long studentId) {
        // Similar implementation but for specific student and course
        GradebookDTO gradebook = new GradebookDTO();
        List<GradeDTO> grades = new ArrayList<>();
        
        // Get assignments and assessments for the course
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        for (Assignment assignment : assignments) {
            submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), studentId)
                .ifPresent(submission -> {
                    if (submission.getMarksObtained() != null) {
                        GradeDTO grade = new GradeDTO(
                            assignment.getCourse().getCourseName(),
                            assignment.getTitle(),
                            "ASSIGNMENT",
                            submission.getMarksObtained().doubleValue(),
                            assignment.getMaxMarks()
                        );
                        grades.add(grade);
                    }
                });
        }
        
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        for (Assessment assessment : assessments) {
            attemptRepository.findByAssessmentIdAndStudentId(assessment.getId(), studentId)
                .ifPresent(attempt -> {
                    if (attempt.getMarksObtained() != null) {
                        GradeDTO grade = new GradeDTO(
                            assessment.getCourse().getCourseName(),
                            assessment.getTitle(),
                            assessment.getAssessmentType().toString(),
                            attempt.getMarksObtained(),
                            assessment.getTotalMarks()
                        );
                        grades.add(grade);
                    }
                });
        }
        
        gradebook.setGrades(grades);
        
        if (!grades.isEmpty()) {
            double avgPercentage = grades.stream()
                .mapToDouble(GradeDTO::getPercentage)
                .average()
                .orElse(0.0);
            gradebook.setOverallAverage(avgPercentage);
            gradebook.setOverallGrade(calculateGrade(avgPercentage));
        }
        
        return ResponseEntity.ok(gradebook);
    }
    
    @GetMapping("/course/{courseId}/performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<Map<String, Object>> getCoursePerformance(@PathVariable Long courseId) {
        Map<String, Object> performance = new HashMap<>();
        
        // Get all enrolled students
        List<Enrollment> enrollments = enrollmentRepository.findByCourseIdAndStatus(courseId, EnrollmentStatus.APPROVED);
        
        List<Map<String, Object>> studentPerformances = new ArrayList<>();
        
        for (Enrollment enrollment : enrollments) {
            Map<String, Object> studentData = new HashMap<>();
            studentData.put("studentId", enrollment.getStudent().getId());
            studentData.put("studentName", enrollment.getStudent().getFullName());
            
            List<GradeDTO> grades = new ArrayList<>();
            
            // Get assignments
            List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
            for (Assignment assignment : assignments) {
                submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), enrollment.getStudent().getId())
                    .ifPresent(submission -> {
                        if (submission.getMarksObtained() != null) {
                            GradeDTO grade = new GradeDTO(
                                assignment.getCourse().getCourseName(),
                                assignment.getTitle(),
                                "ASSIGNMENT",
                                submission.getMarksObtained().doubleValue(),
                                assignment.getMaxMarks()
                            );
                            grades.add(grade);
                        }
                    });
            }
            
            // Get assessments
            List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
            for (Assessment assessment : assessments) {
                attemptRepository.findByAssessmentIdAndStudentId(assessment.getId(), enrollment.getStudent().getId())
                    .ifPresent(attempt -> {
                        if (attempt.getMarksObtained() != null) {
                            GradeDTO grade = new GradeDTO(
                                assessment.getCourse().getCourseName(),
                                assessment.getTitle(),
                                assessment.getAssessmentType().toString(),
                                attempt.getMarksObtained(),
                                assessment.getTotalMarks()
                            );
                            grades.add(grade);
                        }
                    });
            }
            
            if (!grades.isEmpty()) {
                double avgPercentage = grades.stream()
                    .mapToDouble(GradeDTO::getPercentage)
                    .average()
                    .orElse(0.0);
                studentData.put("average", avgPercentage);
                studentData.put("grade", calculateGrade(avgPercentage));
            } else {
                studentData.put("average", 0.0);
                studentData.put("grade", "N/A");
            }
            
            studentPerformances.add(studentData);
        }
        
        performance.put("students", studentPerformances);
        performance.put("totalStudents", enrollments.size());
        
        // Calculate class average
        double classAverage = studentPerformances.stream()
            .filter(s -> s.get("average") != null)
            .mapToDouble(s -> (Double) s.get("average"))
            .average()
            .orElse(0.0);
        performance.put("classAverage", classAverage);
        
        return ResponseEntity.ok(performance);
    }
    
    private String calculateGrade(Double percentage) {
        if (percentage >= 90) return "A+";
        if (percentage >= 80) return "A";
        if (percentage >= 70) return "B+";
        if (percentage >= 60) return "B";
        if (percentage >= 50) return "C";
        if (percentage >= 40) return "D";
        return "F";
    }
}
