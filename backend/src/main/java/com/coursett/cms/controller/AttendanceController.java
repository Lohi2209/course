package com.coursett.cms.controller;

import com.coursett.cms.dto.AttendanceEntryRequest;
import com.coursett.cms.dto.AttendanceMarkRequest;
import com.coursett.cms.dto.AttendanceRecordResponse;
import com.coursett.cms.dto.AttendanceSummaryResponse;
import com.coursett.cms.model.*;
import com.coursett.cms.repository.AppUserRepository;
import com.coursett.cms.repository.AttendanceRecordRepository;
import com.coursett.cms.repository.CourseRepository;
import com.coursett.cms.repository.EnrollmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Objects;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayOutputStream;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184", "https://course-management-frontend-m277.onrender.com"})
public class AttendanceController {

    private final AttendanceRecordRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final AppUserRepository userRepository;

    public AttendanceController(AttendanceRecordRepository attendanceRepository,
                                EnrollmentRepository enrollmentRepository,
                                CourseRepository courseRepository,
                                AppUserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<?> markAttendance(@Valid @RequestBody AttendanceMarkRequest request,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        AppUser marker = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepository.findById(Objects.requireNonNull(request.getCourseId()))
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Set<Long> approvedStudentIds = enrollmentRepository
                .findByCourseIdAndStatus(course.getId(), EnrollmentStatus.APPROVED)
                .stream()
                .map(enrollment -> enrollment.getStudent().getId())
                .collect(Collectors.toSet());

        if (approvedStudentIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No approved students found for this course"));
        }

        List<AttendanceRecordResponse> savedRecords = new ArrayList<>();

        for (AttendanceEntryRequest entry : request.getRecords()) {
            if (!approvedStudentIds.contains(entry.getStudentId())) {
                continue;
            }

                AppUser student = userRepository.findById(Objects.requireNonNull(entry.getStudentId()))
                    .orElseThrow(() -> new RuntimeException("Student not found: " + entry.getStudentId()));

            AttendanceRecord record = attendanceRepository
                    .findByCourseIdAndStudentIdAndAttendanceDate(course.getId(), student.getId(), request.getAttendanceDate())
                    .orElse(new AttendanceRecord());

            record.setCourse(course);
            record.setStudent(student);
            record.setAttendanceDate(request.getAttendanceDate());
            record.setStatus(entry.getStatus());
            record.setRemarks(entry.getRemarks());
            record.setMarkedBy(marker);

            AttendanceRecord saved = attendanceRepository.save(record);
            savedRecords.add(toResponse(saved));
        }

        return ResponseEntity.ok(savedRecords);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    public ResponseEntity<List<AttendanceRecordResponse>> getCourseAttendanceByDate(@PathVariable Long courseId,
                                                                                     @RequestParam(required = false) String attendanceDate) {
        LocalDate date = attendanceDate == null || attendanceDate.isBlank()
                ? LocalDate.now()
                : LocalDate.parse(attendanceDate);

        List<AttendanceRecordResponse> records = attendanceRepository
                .findByCourseIdAndAttendanceDateOrderByStudentFullNameAsc(courseId, date)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    @GetMapping("/student/my-records")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AttendanceRecordResponse>> getMyAttendanceRecords(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<AttendanceRecordResponse> records = attendanceRepository
                .findByStudentIdOrderByAttendanceDateDesc(student.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    @GetMapping("/student/my-summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyAttendanceSummary(@AuthenticationPrincipal UserDetails userDetails) {
        AppUser student = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Enrollment> approvedEnrollments = enrollmentRepository.findByStudentIdAndStatus(student.getId(), EnrollmentStatus.APPROVED);
        List<AttendanceSummaryResponse> courseSummaries = new ArrayList<>();

        long overallTotal = 0;
        long overallPresentOrLate = 0;

        for (Enrollment enrollment : approvedEnrollments) {
            Course course = enrollment.getCourse();
            long total = attendanceRepository.countByCourseIdAndStudentId(course.getId(), student.getId());
            long present = attendanceRepository.countByCourseIdAndStudentIdAndStatus(course.getId(), student.getId(), AttendanceStatus.PRESENT);
            long late = attendanceRepository.countByCourseIdAndStudentIdAndStatus(course.getId(), student.getId(), AttendanceStatus.LATE);

            AttendanceSummaryResponse summary = new AttendanceSummaryResponse();
            summary.setCourseId(course.getId());
            summary.setCourseName(course.getCourseName());
            summary.setTotalClasses(total);
            summary.setPresentClasses(present);
            summary.setLateClasses(late);
            summary.setAttendancePercentage(calculatePercentage(total, present + late));
            courseSummaries.add(summary);

            overallTotal += total;
            overallPresentOrLate += present + late;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("overallAttendancePercentage", calculatePercentage(overallTotal, overallPresentOrLate));
        payload.put("courseSummaries", courseSummaries);

        return ResponseEntity.ok(payload);
    }

        @GetMapping("/export")
        @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
        public ResponseEntity<byte[]> exportAttendanceReport(@RequestParam Long courseId,
                                 @RequestParam String month,
                                 @RequestParam(defaultValue = "csv") String format) {
        Course course = courseRepository.findById(Objects.requireNonNull(courseId))
            .orElseThrow(() -> new RuntimeException("Course not found"));

        YearMonth yearMonth = YearMonth.parse(month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        List<AttendanceRecord> records = attendanceRepository
            .findByCourseIdAndAttendanceDateBetweenOrderByAttendanceDateAscStudentFullNameAsc(course.getId(), start, end);

        String safeMonth = yearMonth.toString();
        String baseFileName = "attendance_" + course.getCourseCode() + "_" + safeMonth;

        if ("pdf".equalsIgnoreCase(format)) {
            byte[] pdfBytes = generateAttendancePdf(course, yearMonth, records);
            @SuppressWarnings("null")
            var respPdf = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + baseFileName + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
            return respPdf;
        }

        String csv = generateAttendanceCsv(course, yearMonth, records);
        @SuppressWarnings("null")
        var respCsv = ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + baseFileName + ".csv")
            .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
            .body(csv.getBytes(StandardCharsets.UTF_8));
        return respCsv;
        }

    private double calculatePercentage(long totalClasses, long attendedClasses) {
        if (totalClasses <= 0) {
            return 0.0;
        }
        return Math.round((attendedClasses * 10000.0) / totalClasses) / 100.0;
    }

    private AttendanceRecordResponse toResponse(AttendanceRecord record) {
        AttendanceRecordResponse response = new AttendanceRecordResponse();
        response.setId(record.getId());
        response.setCourseId(record.getCourse().getId());
        response.setCourseName(record.getCourse().getCourseName());
        response.setStudentId(record.getStudent().getId());
        response.setStudentName(record.getStudent().getFullName());
        response.setAttendanceDate(record.getAttendanceDate());
        response.setStatus(record.getStatus());
        response.setRemarks(record.getRemarks());
        response.setMarkedBy(record.getMarkedBy() != null ? record.getMarkedBy().getFullName() : null);
        response.setMarkedAt(record.getMarkedAt());
        return response;
    }

    private String generateAttendanceCsv(Course course, YearMonth month, List<AttendanceRecord> records) {
        StringBuilder csv = new StringBuilder();
        csv.append("Course Code,Course Name,Month\n");
        csv.append(escapeCsv(course.getCourseCode())).append(",")
                .append(escapeCsv(course.getCourseName())).append(",")
                .append(month).append("\n\n");

        csv.append("Date,Student Name,Status,Remarks,Marked By\n");
        for (AttendanceRecord record : records) {
            csv.append(record.getAttendanceDate()).append(",")
                    .append(escapeCsv(record.getStudent().getFullName())).append(",")
                    .append(record.getStatus()).append(",")
                    .append(escapeCsv(record.getRemarks())).append(",")
                    .append(escapeCsv(record.getMarkedBy() != null ? record.getMarkedBy().getFullName() : ""))
                    .append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String value) {
        String sanitized = value == null ? "" : value;
        if (sanitized.contains(",") || sanitized.contains("\"") || sanitized.contains("\n")) {
            return "\"" + sanitized.replace("\"", "\"\"") + "\"";
        }
        return sanitized;
    }

    private byte[] generateAttendancePdf(Course course, YearMonth month, List<AttendanceRecord> records) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font subtitleFont = new Font(Font.HELVETICA, 11, Font.NORMAL);

            document.add(new Paragraph("Attendance Report", titleFont));
            document.add(new Paragraph("Course: " + course.getCourseCode() + " - " + course.getCourseName(), subtitleFont));
            document.add(new Paragraph("Month: " + month, subtitleFont));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 2.0f, 1.0f, 2.0f, 1.6f});

            addPdfHeaderCell(table, "Date");
            addPdfHeaderCell(table, "Student");
            addPdfHeaderCell(table, "Status");
            addPdfHeaderCell(table, "Remarks");
            addPdfHeaderCell(table, "Marked By");

            for (AttendanceRecord record : records) {
                table.addCell(record.getAttendanceDate().toString());
                table.addCell(record.getStudent().getFullName());
                table.addCell(record.getStatus().name());
                table.addCell(record.getRemarks() == null ? "" : record.getRemarks());
                table.addCell(record.getMarkedBy() == null ? "" : record.getMarkedBy().getFullName());
            }

            document.add(table);
            document.close();
            return outputStream.toByteArray();
        } catch (DocumentException | java.io.IOException ex) {
            throw new RuntimeException("Failed to generate attendance PDF", ex);
        }
    }

    private void addPdfHeaderCell(PdfPTable table, String text) {
        Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
        PdfPCell header = new PdfPCell(new Paragraph(text, headerFont));
        table.addCell(header);
    }
}
