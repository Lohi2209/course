package com.coursett.cms.service;

import com.coursett.cms.exception.ResourceNotFoundException;
import com.coursett.cms.model.Course;
import com.coursett.cms.repository.CourseRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(@NonNull Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    public Course createCourse(@NonNull Course course) {
        if (courseRepository.existsByCourseCode(course.getCourseCode())) {
            throw new DataIntegrityViolationException("Course code already exists: " + course.getCourseCode());
        }
        return courseRepository.save(course);
    }

    public Course updateCourse(@NonNull Long id, @NonNull Course updatedCourse) {
        Course existing = getCourseById(id);
        if (!existing.getCourseCode().equals(updatedCourse.getCourseCode())
                && courseRepository.existsByCourseCode(updatedCourse.getCourseCode())) {
            throw new DataIntegrityViolationException("Course code already exists: " + updatedCourse.getCourseCode());
        }

        existing.setCourseCode(updatedCourse.getCourseCode());
        existing.setCourseName(updatedCourse.getCourseName());
        existing.setDescription(updatedCourse.getDescription());
        existing.setDurationInWeeks(updatedCourse.getDurationInWeeks());
        existing.setFaculty(updatedCourse.getFaculty());
        existing.setPrerequisites(updatedCourse.getPrerequisites());
        existing.setSemester(updatedCourse.getSemester());
        existing.setStartDate(updatedCourse.getStartDate());
        existing.setEndDate(updatedCourse.getEndDate());
        existing.setMeetingDays(updatedCourse.getMeetingDays());
        existing.setMeetingTime(updatedCourse.getMeetingTime());

        return courseRepository.save(existing);
    }

    public void deleteCourse(@NonNull Long id) {
        getCourseById(id);
        courseRepository.deleteById(id);
    }
}
