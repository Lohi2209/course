package com.coursett.cms.controller;

import com.coursett.cms.dto.MaterialResponse;
import com.coursett.cms.model.CourseMaterial;
import com.coursett.cms.model.MaterialType;
import com.coursett.cms.repository.CourseMaterialRepository;
import com.coursett.cms.repository.CourseRepository;
import com.coursett.cms.repository.AppUserRepository;
import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Course;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Objects;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184"})
public class MaterialUploadController {

    @Value("${file.upload.dir:./uploads/materials}")
    private String uploadDir;

    private final CourseMaterialRepository materialRepository;
    private final CourseRepository courseRepository;
    private final AppUserRepository userRepository;

    public MaterialUploadController(CourseMaterialRepository materialRepository,
                                   CourseRepository courseRepository,
                                   AppUserRepository userRepository) {
        this.materialRepository = materialRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<MaterialResponse> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("courseId") Long courseId,
            @RequestParam(value = "materialType", required = false) String materialType) {

        try {
            // Validate file
            validateFile(file);

            // Get course
            Course course = courseRepository.findById(Objects.requireNonNull(courseId))
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            // Get current user
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            AppUser user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Determine material type
            MaterialType type = determineMaterialType(file.getOriginalFilename(), materialType);

            // Save file
            String filePath = saveFile(file);

            // Create and save material
            CourseMaterial material = new CourseMaterial();
            material.setTitle(title);
            material.setDescription(description);
            material.setMaterialType(type);
            material.setUrl(filePath);
            material.setCourse(course);
            material.setUploadedBy(user);
            material.setUploadedAt(LocalDateTime.now());

            CourseMaterial saved = materialRepository.save(material);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertToResponse(saved));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MaterialResponse(
                    null, null, null, null, null, e.getMessage(), null, null
            ));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<MaterialResponse>> getMaterialsByCourse(@PathVariable Long courseId) {
        try {
            Course course = courseRepository.findById(Objects.requireNonNull(courseId))
                    .orElseThrow(() -> new RuntimeException("Course not found"));

            List<CourseMaterial> materials = materialRepository.findByCourse(course);
            List<MaterialResponse> responses = new ArrayList<>();

            for (CourseMaterial material : materials) {
                responses.add(convertToResponse(material));
            }

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialResponse> getMaterialById(@PathVariable Long id) {
        try {
            CourseMaterial material = materialRepository.findById(Objects.requireNonNull(id))
                    .orElseThrow(() -> new RuntimeException("Material not found"));
            return ResponseEntity.ok(convertToResponse(material));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        try {
            CourseMaterial material = materialRepository.findById(Objects.requireNonNull(id))
                    .orElseThrow(() -> new RuntimeException("Material not found"));

            // Delete file from storage
            deleteFile(material.getUrl());

            // Delete from database
            materialRepository.deleteById(Objects.requireNonNull(id));

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private void validateFile(MultipartFile file) throws RuntimeException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new RuntimeException("Invalid filename");
        }

        // Check file size (max 50MB)
        if (file.getSize() > 50 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 50MB limit");
        }

        // Check file type
        String fileExtension = getFileExtension(filename).toLowerCase();
        if (!Arrays.asList("pdf", "ppt", "pptx").contains(fileExtension)) {
            throw new RuntimeException("Only PDF, PPT, and PPTX files are allowed");
        }
    }

    private MaterialType determineMaterialType(String filename, String materialType) {
        if (materialType != null && !materialType.isBlank()) {
            try {
                return MaterialType.valueOf(materialType.toUpperCase());
            } catch (IllegalArgumentException e) {
                // Fall through to file extension check
            }
        }

        String extension = getFileExtension(filename).toLowerCase();
        return switch (extension) {
            case "pdf" -> MaterialType.PDF;
            case "ppt", "pptx" -> MaterialType.PPT;
            default -> MaterialType.LINK;
        };
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filename.length() - 1) {
            return filename.substring(lastDot + 1);
        }
        return "";
    }

    private String saveFile(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String uniqueFilename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFilename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Return relative path for storage
        return "uploads/materials/" + uniqueFilename;
    }

    private void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(filePath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }

    private MaterialResponse convertToResponse(CourseMaterial material) {
        return new MaterialResponse(
                material.getId(),
                material.getTitle(),
                material.getDescription(),
                material.getMaterialType().name(),
                material.getUrl(),
                null,
                material.getUploadedBy() != null ? material.getUploadedBy().getUsername() : null,
                material.getUploadedAt()
        );
    }
}
