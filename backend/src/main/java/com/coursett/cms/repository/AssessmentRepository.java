package com.coursett.cms.repository;

import com.coursett.cms.model.Assessment;
import com.coursett.cms.model.AssessmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByCourseId(Long courseId);
    List<Assessment> findByCourseIdAndAssessmentType(Long courseId, AssessmentType type);
    List<Assessment> findByCreatedById(Long createdById);
}
