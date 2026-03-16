package com.coursett.cms.repository;

import com.coursett.cms.model.AttendanceRecord;
import com.coursett.cms.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByStudentIdOrderByAttendanceDateDesc(Long studentId);

    List<AttendanceRecord> findByCourseIdAndAttendanceDateOrderByStudentFullNameAsc(Long courseId, LocalDate attendanceDate);

        List<AttendanceRecord> findByCourseIdAndAttendanceDateBetweenOrderByAttendanceDateAscStudentFullNameAsc(
            Long courseId,
            LocalDate startDate,
            LocalDate endDate
        );

    List<AttendanceRecord> findByCourseIdAndStudentIdOrderByAttendanceDateDesc(Long courseId, Long studentId);

    Optional<AttendanceRecord> findByCourseIdAndStudentIdAndAttendanceDate(Long courseId, Long studentId, LocalDate attendanceDate);

    long countByCourseIdAndStudentId(Long courseId, Long studentId);

    long countByCourseIdAndStudentIdAndStatus(Long courseId, Long studentId, AttendanceStatus status);
}
