package com.coursett.cms.controller;

import com.coursett.cms.dto.CourseMaterialRequest;
import com.coursett.cms.dto.CourseMaterialResponse;
import com.coursett.cms.dto.MessageResponse;
import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Course;
import com.coursett.cms.model.CourseMaterial;
import com.coursett.cms.repository.AppUserRepository;
import com.coursett.cms.repository.CourseMaterialRepository;
import com.coursett.cms.repository.CourseRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184", "https://course-management-frontend-m277.onrender.com"})
public class CourseMaterialController {

    @Autowired
    private CourseMaterialRepository materialRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<CourseMaterialResponse>> getAllMaterials() {
        List<CourseMaterial> materials = materialRepository.findAll();
        List<CourseMaterialResponse> response = materials.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterialResponse> getMaterialById(@PathVariable @NonNull Long id) {
        CourseMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
        return ResponseEntity.ok(toResponse(material));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseMaterialResponse>> getMaterialsByCourse(@PathVariable @NonNull Long courseId) {
        List<CourseMaterial> materials = materialRepository.findByCourseId(courseId);
        List<CourseMaterialResponse> response = materials.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<CourseMaterialResponse> createMaterial(
            @Valid @RequestBody @NonNull CourseMaterialRequest request,
            @NonNull Authentication authentication) {
        
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        AppUser user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CourseMaterial material = new CourseMaterial(
                request.getTitle(),
                request.getDescription(),
                request.getMaterialType(),
                request.getUrl(),
                course,
                user
        );

        CourseMaterial saved = materialRepository.save(material);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'HOD')")
    @SuppressWarnings("null")
    public ResponseEntity<CourseMaterialResponse> updateMaterial(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody @NonNull CourseMaterialRequest request) {
        
        CourseMaterial material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        material.setTitle(request.getTitle());
        material.setDescription(request.getDescription());
        material.setMaterialType(request.getMaterialType());
        material.setUrl(request.getUrl());
        material.setCourse(course);

        CourseMaterial updated = materialRepository.save(material);
        return ResponseEntity.ok(toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HOD')")
    public ResponseEntity<MessageResponse> deleteMaterial(@PathVariable @NonNull Long id) {
        if (!materialRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Material not found"));
        }
        materialRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Material deleted successfully"));
    }

    private CourseMaterialResponse toResponse(CourseMaterial material) {
        return new CourseMaterialResponse(
                material.getId(),
                material.getTitle(),
                material.getDescription(),
                material.getMaterialType(),
                material.getUrl(),
                material.getCourse().getId(),
                material.getCourse().getCourseName(),
                material.getUploadedBy() != null ? material.getUploadedBy().getUsername() : "Unknown",
                material.getUploadedAt()
        );
    }
}
