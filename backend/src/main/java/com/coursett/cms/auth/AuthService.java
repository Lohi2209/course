package com.coursett.cms.auth;

import com.coursett.cms.dto.AuthRequest;
import com.coursett.cms.dto.AuthResponse;
import com.coursett.cms.dto.RegisterRequest;
import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Role;
import com.coursett.cms.repository.AppUserRepository;
import com.coursett.cms.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AppUserRepository appUserRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new DataIntegrityViolationException("Username already exists: " + request.getUsername());
        }

        if (appUserRepository.existsByEmail(request.getEmail())) {
            throw new DataIntegrityViolationException("Email already exists: " + request.getEmail());
        }

        // Allow user registration with any role
        Role role = request.getRole() == null ? Role.STUDENT : request.getRole();

        AppUser appUser = new AppUser();
        appUser.setUsername(request.getUsername());
        appUser.setPassword(passwordEncoder.encode(request.getPassword()));
        appUser.setFullName(request.getFullName());
        appUser.setEmail(request.getEmail());
        appUser.setRole(role);

        AppUser saved = appUserRepository.save(appUser);
        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(saved.getUsername())
                        .password(saved.getPassword())
                        .authorities("ROLE_" + saved.getRole().name())
                        .build(),
                saved.getRole().name());

        return new AuthResponse(token, saved.getUsername(), saved.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        AppUser appUser = appUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new DataIntegrityViolationException("Invalid username or password"));

        String token = jwtService.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(appUser.getUsername())
                        .password(appUser.getPassword())
                        .authorities("ROLE_" + appUser.getRole().name())
                        .build(),
                appUser.getRole().name());

        return new AuthResponse(token, appUser.getUsername(), appUser.getRole().name());
    }
}
