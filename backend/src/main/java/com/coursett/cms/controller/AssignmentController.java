package com.coursett.cms.controller;

import com.coursett.cms.model.*;
import com.coursett.cms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184"})
public class AssignmentController {
    
    @Autowired
    private AssignmentRepository assignmentRepository;
    
    @Autowired
    private SubmissionRepository submissionRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private AppUserRepository userRepository;
    
    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return ResponseEntity.ok(assignments);
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> createAssignment(@RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser faculty = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Assignment assignment = new Assignment();
            assignment.setTitle((String) request.get("title"));
            assignment.setDescription((String) request.get("description"));
            assignment.setMaxMarks((Integer) request.get("maxMarks"));
            assignment.setDueDate(LocalDateTime.parse((String) request.get("dueDate")));
            assignment.setCreatedBy(faculty);
            
            Long courseId = Long.valueOf(request.get("courseId").toString());
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            assignment.setCourse(course);
            
            Assignment saved = assignmentRepository.save(assignment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateAssignment(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
            
            if (request.containsKey("title")) assignment.setTitle((String) request.get("title"));
            if (request.containsKey("description")) assignment.setDescription((String) request.get("description"));
            if (request.containsKey("maxMarks")) assignment.setMaxMarks((Integer) request.get("maxMarks"));
            if (request.containsKey("dueDate")) assignment.setDueDate(LocalDateTime.parse((String) request.get("dueDate")));
            
            Assignment updated = assignmentRepository.save(assignment);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        assignmentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully"));
    }
    
    @PostMapping("/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @SuppressWarnings("null")
    public ResponseEntity<?> submitAssignment(@PathVariable Long assignmentId, 
                                             @RequestBody Map<String, String> request,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser student = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
            
            // Check if already submitted
            submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .ifPresent(s -> {
                    throw new RuntimeException("Already submitted");
                });
            
            Submission submission = new Submission();
            submission.setAssignment(assignment);
            submission.setStudent(student);
            submission.setSubmissionText(request.get("submissionText"));
            submission.setFileUrl(request.get("fileUrl"));
            
            Submission saved = submissionRepository.save(submission);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/my-submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Submission>> getMySubmissions(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        List<Submission> submissions = submissionRepository.findByStudentId(student.getId());
        return ResponseEntity.ok(submissions);
    }
    
    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long submissionId,
                                            @RequestBody Map<String, Object> request,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser grader = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
            
            submission.setMarksObtained(Integer.valueOf(request.get("marksObtained").toString()));
            submission.setFeedback((String) request.get("feedback"));
            submission.setGradedAt(LocalDateTime.now());
            submission.setGradedBy(grader);
            
            Submission updated = submissionRepository.save(submission);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
