package com.coursett.cms.repository;

import com.coursett.cms.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByAssessmentIdOrderByOrderAsc(Long assessmentId);
}
