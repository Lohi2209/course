package com.coursett.cms.controller;

import com.coursett.cms.dto.AdminDashboardDTO;
import com.coursett.cms.dto.LowAttendanceAlertDTO;
import com.coursett.cms.dto.ProfileResponse;
import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.AttendanceStatus;
import com.coursett.cms.model.Enrollment;
import com.coursett.cms.model.EnrollmentStatus;
import com.coursett.cms.model.Role;
import com.coursett.cms.repository.AttendanceRecordRepository;
import com.coursett.cms.repository.AppUserRepository;
import com.coursett.cms.repository.CourseRepository;
import com.coursett.cms.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/dashboard/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184"})
public class AdminDashboardController {
    
    @Autowired
    private AppUserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;

        @Autowired
        private AttendanceRecordRepository attendanceRecordRepository;
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<AdminDashboardDTO> getAdminStats() {
        Long totalStudents = userRepository.countByRole(Role.STUDENT);
        Long totalFaculty = userRepository.countByRole(Role.FACULTY);
        Long totalHod = userRepository.countByRole(Role.HOD);
        Long totalCourses = courseRepository.count();
        Long totalEnrollments = enrollmentRepository.count();
        
        Map<String, Long> enrollmentsByStatus = new HashMap<>();
        enrollmentsByStatus.put("PENDING", enrollmentRepository.countByStatus(EnrollmentStatus.PENDING));
        enrollmentsByStatus.put("APPROVED", enrollmentRepository.countByStatus(EnrollmentStatus.APPROVED));
        enrollmentsByStatus.put("REJECTED", enrollmentRepository.countByStatus(EnrollmentStatus.REJECTED));
        enrollmentsByStatus.put("DROPPED", enrollmentRepository.countByStatus(EnrollmentStatus.DROPPED));
        
        Long pendingEnrollments = enrollmentRepository.countByStatus(EnrollmentStatus.PENDING);

                List<LowAttendanceAlertDTO> lowAttendanceAlerts = buildLowAttendanceAlertsForAllApprovedEnrollments();
        
        AdminDashboardDTO dto = new AdminDashboardDTO(
            totalStudents, 
            totalCourses, 
            totalEnrollments, 
            enrollmentsByStatus,
            totalFaculty,
                        totalHod,
                        pendingEnrollments,
                        (long) lowAttendanceAlerts.size(),
                        lowAttendanceAlerts
        );
        
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/users/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<ProfileResponse>> getAllStudents() {
        List<AppUser> students = userRepository.findByRole(Role.STUDENT);
        List<ProfileResponse> response = students.stream()
                .map(user -> new ProfileResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users/faculty")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<ProfileResponse>> getAllFaculty() {
        List<AppUser> faculty = userRepository.findByRole(Role.FACULTY);
        List<ProfileResponse> response = faculty.stream()
                .map(user -> new ProfileResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users/hod")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<ProfileResponse>> getAllHOD() {
        List<AppUser> hods = userRepository.findByRole(Role.HOD);
        List<ProfileResponse> response = hods.stream()
                .map(user -> new ProfileResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<List<ProfileResponse>> getAllUsers() {
        List<AppUser> users = userRepository.findAll();
        List<ProfileResponse> response = users.stream()
                .map(user -> new ProfileResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

        private List<LowAttendanceAlertDTO> buildLowAttendanceAlertsForAllApprovedEnrollments() {
                List<Enrollment> approvedEnrollments = enrollmentRepository.findByStatus(EnrollmentStatus.APPROVED);
                List<LowAttendanceAlertDTO> alerts = new ArrayList<>();

                for (Enrollment enrollment : approvedEnrollments) {
                        long totalClasses = attendanceRecordRepository.countByCourseIdAndStudentId(
                                        enrollment.getCourse().getId(),
                                        enrollment.getStudent().getId()
                        );
                        if (totalClasses <= 0) {
                                continue;
                        }

                        long present = attendanceRecordRepository.countByCourseIdAndStudentIdAndStatus(
                                        enrollment.getCourse().getId(),
                                        enrollment.getStudent().getId(),
                                        AttendanceStatus.PRESENT
                        );
                        long late = attendanceRecordRepository.countByCourseIdAndStudentIdAndStatus(
                                        enrollment.getCourse().getId(),
                                        enrollment.getStudent().getId(),
                                        AttendanceStatus.LATE
                        );
                        double percentage = Math.round(((present + late) * 10000.0 / totalClasses)) / 100.0;

                        if (percentage < 75.0) {
                                LowAttendanceAlertDTO alert = new LowAttendanceAlertDTO();
                                alert.setCourseId(enrollment.getCourse().getId());
                                alert.setCourseName(enrollment.getCourse().getCourseName());
                                alert.setStudentId(enrollment.getStudent().getId());
                                alert.setStudentName(enrollment.getStudent().getFullName());
                                alert.setAttendancePercentage(percentage);
                                alert.setTotalClasses(totalClasses);
                                alerts.add(alert);
                        }
                }

                return alerts.stream()
                                .sorted((a, b) -> Double.compare(a.getAttendancePercentage(), b.getAttendancePercentage()))
                                .limit(20)
                                .collect(Collectors.toList());
        }
}
