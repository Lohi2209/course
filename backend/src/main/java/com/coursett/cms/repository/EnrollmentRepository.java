package com.coursett.cms.repository;

import com.coursett.cms.model.Enrollment;
import com.coursett.cms.model.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    List<Enrollment> findByStudentId(Long studentId);
    
    List<Enrollment> findByCourseId(Long courseId);
    
    List<Enrollment> findByStatus(EnrollmentStatus status);
    
    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
    List<Enrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
    
    List<Enrollment> findByCourseIdAndStatus(Long courseId, EnrollmentStatus status);
    
    Long countByStatus(EnrollmentStatus status);
    
    Long countByCourseFacultyIdAndStatus(Long facultyId, EnrollmentStatus status);
}
