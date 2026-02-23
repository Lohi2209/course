package com.coursett.cms.repository;

import com.coursett.cms.model.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    List<AssessmentAttempt> findByAssessmentId(Long assessmentId);
    List<AssessmentAttempt> findByStudentId(Long studentId);
    Optional<AssessmentAttempt> findByAssessmentIdAndStudentId(Long assessmentId, Long studentId);
    Long countByAssessmentIdAndMarksObtainedIsNull(Long assessmentId);
    List<AssessmentAttempt> findByAssessmentIdAndSubmittedAtIsNotNull(Long assessmentId);
}
