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
@RequestMapping("/api/assessments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184"})
public class AssessmentController {
    
    @Autowired
    private AssessmentRepository assessmentRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private AssessmentAttemptRepository attemptRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private AppUserRepository userRepository;
    
    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Assessment>> getAssessmentsByCourse(@PathVariable Long courseId) {
        List<Assessment> assessments = assessmentRepository.findByCourseId(courseId);
        return ResponseEntity.ok(assessments);
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> createAssessment(@RequestBody Map<String, Object> request, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            System.out.println("=== CREATE ASSESSMENT REQUEST ===");
            System.out.println("Request Body: " + request);
            System.out.println("User: " + userDetails.getUsername());
            System.out.println("==================================");
            
            // Validate courseId first
            if (!request.containsKey("courseId") || request.get("courseId") == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Course ID is required"));
            }

            // Get and validate user
            AppUser faculty = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found: " + userDetails.getUsername()));
            
            Assessment assessment = new Assessment();
            
            // Title
            String title = (String) request.get("title");
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Title is required"));
            }
            assessment.setTitle(title.trim());
            
            // Description (optional)
            String description = (String) request.get("description");
            assessment.setDescription(description != null ? description : "");
            
            // Assessment Type
            String assessmentTypeStr = (String) request.get("assessmentType");
            if (assessmentTypeStr == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Assessment type is required"));
            }
            try {
                assessment.setAssessmentType(AssessmentType.valueOf(assessmentTypeStr));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid assessment type: " + assessmentTypeStr));
            }
            
            // Total Marks
            Object totalMarksObj = request.get("totalMarks");
            if (totalMarksObj == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Total marks is required"));
            }
            try {
                Integer totalMarks = totalMarksObj instanceof Integer 
                    ? (Integer) totalMarksObj 
                    : Integer.parseInt(totalMarksObj.toString());
                if (totalMarks <= 0) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Total marks must be greater than 0"));
                }
                assessment.setTotalMarks(totalMarks);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid total marks: " + totalMarksObj));
            }
            
            // Passing Marks
            Object passingMarksObj = request.get("passingMarks");
            if (passingMarksObj != null) {
                try {
                    Integer passingMarks = passingMarksObj instanceof Integer 
                        ? (Integer) passingMarksObj 
                        : Integer.parseInt(passingMarksObj.toString());
                    if (passingMarks >= 0) {
                        assessment.setPassingMarks(passingMarks);
                    }
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Invalid passing marks: " + passingMarksObj));
                }
            } else {
                assessment.setPassingMarks(0);
            }
            
            // Due Date
            String dueDateStr = (String) request.get("dueDate");
            if (dueDateStr == null || dueDateStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Due date is required"));
            }
            try {
                LocalDateTime dueDate = LocalDateTime.parse(dueDateStr);
                assessment.setDueDate(dueDate);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid due date format: " + dueDateStr));
            }
            
            // Auto Grade
            Object autoGradeObj = request.getOrDefault("autoGrade", false);
            Boolean autoGrade = autoGradeObj instanceof Boolean 
                ? (Boolean) autoGradeObj 
                : Boolean.parseBoolean(autoGradeObj.toString());
            assessment.setAutoGrade(autoGrade);
            
            // Duration Minutes
            Object durationObj = request.getOrDefault("durationMinutes", 60);
            try {
                Integer duration = durationObj instanceof Integer 
                    ? (Integer) durationObj 
                    : Integer.parseInt(durationObj.toString());
                if (duration > 0) {
                    assessment.setDurationMinutes(duration);
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid duration: " + durationObj));
            }
            
            // Get and validate Course
            Long courseId = Long.valueOf(request.get("courseId").toString());
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + courseId));
            assessment.setCourse(course);
            assessment.setCreatedBy(faculty);
            
            Assessment saved = assessmentRepository.save(assessment);
            
            System.out.println("Assessment created successfully with ID: " + saved.getId());
            
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("ERROR creating assessment:");
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown error occurred";
            return ResponseEntity.badRequest().body(Map.of(
                "message", errorMessage,
                "type", e.getClass().getSimpleName()
            ));
        }
    }
    
    @PostMapping("/{assessmentId}/questions")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> addQuestion(@PathVariable Long assessmentId, @RequestBody Map<String, Object> request) {
        try {
            Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
            
            Question question = new Question();
            question.setAssessment(assessment);
            question.setQuestionText((String) request.get("questionText"));
            question.setQuestionType(QuestionType.valueOf((String) request.get("questionType")));
            question.setMarks((Integer) request.get("marks"));
            question.setOrder((Integer) request.getOrDefault("order", 1));
            
            if (request.containsKey("optionA")) question.setOptionA((String) request.get("optionA"));
            if (request.containsKey("optionB")) question.setOptionB((String) request.get("optionB"));
            if (request.containsKey("optionC")) question.setOptionC((String) request.get("optionC"));
            if (request.containsKey("optionD")) question.setOptionD((String) request.get("optionD"));
            if (request.containsKey("correctAnswer")) question.setCorrectAnswer((String) request.get("correctAnswer"));
            
            Question saved = questionRepository.save(question);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @GetMapping("/{assessmentId}/questions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Question>> getQuestions(@PathVariable Long assessmentId) {
        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderAsc(assessmentId);
        return ResponseEntity.ok(questions);
    }
    
    @PostMapping("/{assessmentId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    @SuppressWarnings("null")
    public ResponseEntity<?> startAssessment(@PathVariable Long assessmentId, @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser student = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found"));
            
            // Check if already attempted
            if (attemptRepository.findByAssessmentIdAndStudentId(assessmentId, student.getId()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Already attempted"));
            }
            
            AssessmentAttempt attempt = new AssessmentAttempt();
            attempt.setAssessment(assessment);
            attempt.setStudent(student);
            
            AssessmentAttempt saved = attemptRepository.save(attempt);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/{assessmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAssessment(@PathVariable Long assessmentId,
                                             @RequestBody Map<String, String> answers,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser student = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            AssessmentAttempt attempt = attemptRepository.findByAssessmentIdAndStudentId(assessmentId, student.getId())
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
            
            if (attempt.getSubmittedAt() != null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Already submitted"));
            }
            
            // Convert answers map
            Map<Long, String> answerMap = new java.util.HashMap<>();
            answers.forEach((key, value) -> {
                if (key.startsWith("question_")) {
                    Long questionId = Long.parseLong(key.substring(9));
                    answerMap.put(questionId, value);
                }
            });
            
            attempt.setAnswers(answerMap);
            attempt.setSubmittedAt(LocalDateTime.now());
            
            // Auto-grade if enabled
            if (attempt.getAssessment().getAutoGrade()) {
                double totalMarks = autoGradeAttempt(attempt);
                attempt.setMarksObtained(totalMarks);
                attempt.setAutoGraded(true);
                attempt.setGradedAt(LocalDateTime.now());
            }
            
            AssessmentAttempt saved = attemptRepository.save(attempt);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    private double autoGradeAttempt(AssessmentAttempt attempt) {
        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderAsc(attempt.getAssessment().getId());
        double totalMarks = 0.0;
        
        for (Question question : questions) {
            String studentAnswer = attempt.getAnswers().get(question.getId());
            if (studentAnswer != null && question.getCorrectAnswer() != null) {
                // Case-insensitive comparison for objective questions
                if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE ||
                    question.getQuestionType() == QuestionType.TRUE_FALSE) {
                    if (studentAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim())) {
                        totalMarks += question.getMarks();
                    }
                }
            }
        }
        
        return totalMarks;
    }
    
    @GetMapping("/{assessmentId}/attempts")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<List<AssessmentAttempt>> getAttempts(@PathVariable Long assessmentId) {
        List<AssessmentAttempt> attempts = attemptRepository.findByAssessmentIdAndSubmittedAtIsNotNull(assessmentId);
        return ResponseEntity.ok(attempts);
    }
    
    @GetMapping("/my-attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AssessmentAttempt>> getMyAttempts(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        List<AssessmentAttempt> attempts = attemptRepository.findByStudentId(student.getId());
        return ResponseEntity.ok(attempts);
    }
    
    @PutMapping("/attempts/{attemptId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> gradeAttempt(@PathVariable Long attemptId,
                                         @RequestBody Map<String, Object> request,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            AppUser grader = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            AssessmentAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));
            
            attempt.setMarksObtained(Double.valueOf(request.get("marksObtained").toString()));
            attempt.setFeedback((String) request.get("feedback"));
            attempt.setGradedAt(LocalDateTime.now());
            attempt.setGradedBy(grader);
            attempt.setAutoGraded(false);
            
            AssessmentAttempt updated = attemptRepository.save(attempt);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<?> deleteAssessment(@PathVariable Long id) {
        assessmentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Assessment deleted successfully"));
    }
}
