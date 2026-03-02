package com.coursett.cms.controller;

import com.coursett.cms.dto.ProfileResponse;
import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Role;
import com.coursett.cms.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "http://localhost:5183", "http://localhost:5184", "https://course-management-frontend-m277.onrender.com"})
public class UserController {

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping("/faculty")
    public ResponseEntity<List<ProfileResponse>> getAllFaculty() {
        List<AppUser> facultyUsers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.FACULTY || user.getRole() == Role.HOD || user.getRole() == Role.ADMIN)
                .collect(Collectors.toList());

        List<ProfileResponse> response = facultyUsers.stream()
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
}
