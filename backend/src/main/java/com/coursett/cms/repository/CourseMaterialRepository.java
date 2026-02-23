package com.coursett.cms.repository;

import com.coursett.cms.model.CourseMaterial;
import com.coursett.cms.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findByCourseId(Long courseId);
    List<CourseMaterial> findByCourse(Course course);
}
