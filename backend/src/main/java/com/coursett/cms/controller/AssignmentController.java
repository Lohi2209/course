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
    private QuestionRepository questionRepository;
    
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
            assignment.setMaxMarks(Integer.valueOf(request.get("maxMarks").toString()));
            assignment.setDueDate(LocalDateTime.parse((String) request.get("dueDate")));
            assignment.setCreatedBy(faculty);
            if (request.get("assignmentType") != null) {
                assignment.setAssignmentType(AssignmentType.valueOf(request.get("assignmentType").toString()));
            }
            
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
            if (request.containsKey("maxMarks")) assignment.setMaxMarks(Integer.valueOf(request.get("maxMarks").toString()));
            if (request.containsKey("dueDate")) assignment.setDueDate(LocalDateTime.parse((String) request.get("dueDate")));
            if (request.containsKey("assignmentType") && request.get("assignmentType") != null) {
                assignment.setAssignmentType(AssignmentType.valueOf(request.get("assignmentType").toString()));
            }
            
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

    // ── Question endpoints for MCQ/CODING assignments ──────────────────────────

    @GetMapping("/{id}/questions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getAssignmentQuestions(@PathVariable Long id) {
        List<Question> questions = questionRepository.findByAssignmentIdOrderByOrderAsc(id);
        return ResponseEntity.ok(questions.stream().map(this::toQuestionDto).toList());
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> addAssignmentQuestion(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> request) {
        try {
            Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

            Question question = new Question();
            question.setAssignment(assignment);
            question.setQuestionText((String) request.get("questionText"));
            question.setQuestionType(QuestionType.valueOf((String) request.get("questionType")));
            question.setMarks(Integer.valueOf(request.get("marks").toString()));
            question.setOrder(request.get("order") != null ? Integer.valueOf(request.get("order").toString()) : 0);
            question.setOptionA((String) request.get("optionA"));
            question.setOptionB((String) request.get("optionB"));
            question.setOptionC((String) request.get("optionC"));
            question.setOptionD((String) request.get("optionD"));
            question.setCorrectAnswer((String) request.get("correctAnswer"));
            question.setProgrammingLanguages((String) request.get("programmingLanguages"));
            question.setStarterCode((String) request.get("starterCode"));
            question.setCodingConstraints((String) request.get("codingConstraints"));
            question.setSampleInput((String) request.get("sampleInput"));
            question.setExpectedOutput((String) request.get("expectedOutput"));
            question.setTestCasesJson((String) request.get("testCasesJson"));

            Question saved = questionRepository.save(question);
            return ResponseEntity.ok(toQuestionDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/questions/{qId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> deleteAssignmentQuestion(@PathVariable Long id, @PathVariable Long qId) {
        questionRepository.deleteById(qId);
        return ResponseEntity.ok(Map.of("message", "Question deleted"));
    }

    private Map<String, Object> toQuestionDto(Question q) {
        Map<String, Object> dto = new java.util.LinkedHashMap<>();
        dto.put("id", q.getId());
        dto.put("questionText", q.getQuestionText());
        dto.put("questionType", q.getQuestionType());
        dto.put("optionA", q.getOptionA());
        dto.put("optionB", q.getOptionB());
        dto.put("optionC", q.getOptionC());
        dto.put("optionD", q.getOptionD());
        dto.put("correctAnswer", q.getCorrectAnswer());
        dto.put("programmingLanguages", q.getProgrammingLanguages());
        dto.put("starterCode", q.getStarterCode());
        dto.put("codingConstraints", q.getCodingConstraints());
        dto.put("sampleInput", q.getSampleInput());
        dto.put("expectedOutput", q.getExpectedOutput());
        dto.put("testCasesJson", q.getTestCasesJson());
        dto.put("marks", q.getMarks());
        dto.put("order", q.getOrder());
        dto.put("assignmentId", q.getAssignment() != null ? q.getAssignment().getId() : null);
        return dto;
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
            String fileUrl = request.get("fileUrl");
            if (fileUrl == null || fileUrl.isBlank()) {
                fileUrl = request.get("submissionUrl");
            }
            submission.setFileUrl(fileUrl);
            
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
