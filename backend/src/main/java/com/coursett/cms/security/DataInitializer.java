package com.coursett.cms.security;

import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Role;
import com.coursett.cms.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-admin.username:admin}")
    private String defaultAdminUsername;

    @Value("${app.default-admin.password:admin123}")
    private String defaultAdminPassword;

    public DataInitializer(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Find or create admin user
        AppUser admin = appUserRepository.findByUsername(defaultAdminUsername)
                .orElse(new AppUser());
        
        // Always update admin credentials on startup
        admin.setUsername(defaultAdminUsername);
        admin.setPassword(passwordEncoder.encode(defaultAdminPassword));
        admin.setFullName("System Administrator");
        admin.setEmail("admin@coursett.com");
        admin.setRole(Role.ADMIN);
        appUserRepository.save(admin);
        
        System.out.println("Admin user initialized/updated: " + defaultAdminUsername);
        
        // Create default faculty users for testing
        createOrUpdateTestUser("faculty1", "faculty123", "Dr. John Smith", "john@coursett.com", Role.FACULTY);
        createOrUpdateTestUser("faculty2", "faculty123", "Dr. Sarah Johnson", "sarah@coursett.com", Role.FACULTY);
        
        // Create default HOD user for testing
        createOrUpdateTestUser("hod1", "hod123", "Prof. Robert Davis", "hod@coursett.com", Role.HOD);
        
        // Create default student user for testing
        createOrUpdateTestUser("student1", "student123", "John Doe", "student1@coursett.com", Role.STUDENT);
    }
    
    private void createOrUpdateTestUser(String username, String password, String fullName, String email, Role role) {
        AppUser user = appUserRepository.findByUsername(username)
                .orElse(new AppUser());
        
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEmail(email);
        user.setRole(role);
        
        appUserRepository.save(user);
        System.out.println(role.name() + " user initialized/updated: " + username);
    }
}
