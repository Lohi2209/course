package com.coursett.cms.repository;

import com.coursett.cms.model.AppUser;
import com.coursett.cms.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
    Long countByRole(Role role);
    List<AppUser> findByRole(Role role);
}
