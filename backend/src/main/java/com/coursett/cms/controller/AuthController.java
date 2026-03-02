package com.coursett.cms.controller;

import com.coursett.cms.auth.AuthService;
import com.coursett.cms.dto.AuthRequest;
import com.coursett.cms.dto.AuthResponse;
import com.coursett.cms.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", "http://localhost:5182", "https://course-management-frontend-m277.onrender.com"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        try {
            System.out.println("=== REGISTER ENDPOINT === Username: " + request.getUsername());
            AuthResponse response = authService.register(request);
            System.out.println("=== REGISTER SUCCESS === Username: " + response.getUsername());
            return response;
        } catch (Exception e) {
            System.err.println("=== REGISTER ERROR === " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        try {
            System.out.println("=== LOGIN ENDPOINT === Username: " + request.getUsername());
            AuthResponse response = authService.login(request);
            System.out.println("=== LOGIN SUCCESS === Username: " + response.getUsername() + ", Role: " + response.getRole());
            return response;
        } catch (Exception e) {
            System.err.println("=== LOGIN ERROR === " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
