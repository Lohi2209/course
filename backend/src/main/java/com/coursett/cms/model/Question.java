package com.coursett.cms.model;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = true)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = true)
    private Assignment assignment;

    @Column(nullable = false, length = 1000)
    private String questionText;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType;
    
    @Column(name = "option_a", length = 500)
    private String optionA;
    
    @Column(name = "option_b", length = 500)
    private String optionB;
    
    @Column(name = "option_c", length = 500)
    private String optionC;
    
    @Column(name = "option_d", length = 500)
    private String optionD;
    
    @Column(name = "correct_answer", length = 500)
    private String correctAnswer;

    @Column(name = "programming_languages", length = 500)
    private String programmingLanguages;

    @Column(name = "starter_code", length = 4000)
    private String starterCode;

    @Column(name = "coding_constraints", length = 1000)
    private String codingConstraints;

    @Column(name = "sample_input", length = 2000)
    private String sampleInput;

    @Column(name = "expected_output", length = 2000)
    private String expectedOutput;

    @Column(name = "test_cases_json", length = 4000)
    private String testCasesJson;
    
    @Column(nullable = false)
    private Integer marks;
    
    @Column(name = "question_order")
    private Integer order;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Assessment getAssessment() {
        return assessment;
    }
    
    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }

    public Assignment getAssignment() {
        return assignment;
    }

    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }

    public String getQuestionText() {
        return questionText;
    }
    
    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
    
    public QuestionType getQuestionType() {
        return questionType;
    }
    
    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }
    
    public String getOptionA() {
        return optionA;
    }
    
    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }
    
    public String getOptionB() {
        return optionB;
    }
    
    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }
    
    public String getOptionC() {
        return optionC;
    }
    
    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }
    
    public String getOptionD() {
        return optionD;
    }
    
    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }
    
    public String getCorrectAnswer() {
        return correctAnswer;
    }
    
    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
    
    public Integer getMarks() {
        return marks;
    }
    
    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public String getProgrammingLanguages() {
        return programmingLanguages;
    }

    public void setProgrammingLanguages(String programmingLanguages) {
        this.programmingLanguages = programmingLanguages;
    }

    public String getStarterCode() {
        return starterCode;
    }

    public void setStarterCode(String starterCode) {
        this.starterCode = starterCode;
    }

    public String getCodingConstraints() {
        return codingConstraints;
    }

    public void setCodingConstraints(String codingConstraints) {
        this.codingConstraints = codingConstraints;
    }

    public String getSampleInput() {
        return sampleInput;
    }

    public void setSampleInput(String sampleInput) {
        this.sampleInput = sampleInput;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public String getTestCasesJson() {
        return testCasesJson;
    }

    public void setTestCasesJson(String testCasesJson) {
        this.testCasesJson = testCasesJson;
    }
    
    public Integer getOrder() {
        return order;
    }
    
    public void setOrder(Integer order) {
        this.order = order;
    }
}
