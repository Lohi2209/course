package com.coursett.cms.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.util.Collections;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AppUserDetailsService appUserDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, AppUserDetailsService appUserDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.appUserDetailsService = appUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Unauthorized\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"message\":\"Forbidden\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/profile/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/courses/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/courses/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasAnyRole("ADMIN", "HOD")
                        .requestMatchers(HttpMethod.GET, "/api/materials/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/materials/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.PUT, "/api/materials/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.DELETE, "/api/materials/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/uploads/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.DELETE, "/api/uploads/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/student/**").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/enrollments/register").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/enrollments/my-enrollments").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.DELETE, "/api/enrollments/*/drop").hasRole("STUDENT")
                        .requestMatchers("/api/enrollments/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.POST, "/api/assignments/*/submit").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/assignments/my-submissions").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/assignments", "/api/assignments/").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.PUT, "/api/assignments/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers(HttpMethod.DELETE, "/api/assignments/**").hasAnyRole("ADMIN", "HOD")
                        .requestMatchers("/api/assignments/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/assessments/*/start").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/api/assessments/*/submit").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/assessments/my-attempts").hasRole("STUDENT")
                        .requestMatchers("/api/assessments/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/gradebook/student/**").hasRole("STUDENT")
                        .requestMatchers("/api/gradebook/**").hasAnyRole("ADMIN", "FACULTY", "HOD")
                        .requestMatchers("/api/dashboard/admin/**").hasAnyRole("ADMIN", "HOD")
                        .requestMatchers("/api/dashboard/faculty/**").hasRole("FACULTY")
                        .requestMatchers("/api/dashboard/student/**").hasRole("STUDENT")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(appUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // Use ProviderManager to explicitly use our AuthenticationProvider
        return new ProviderManager(Collections.singletonList(authenticationProvider()));
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
            "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
            "http://localhost:5179", "http://localhost:5180", "http://localhost:5181", 
            "http://localhost:5182", "http://localhost:5183", "http://localhost:5184",
            "https://course-management-frontend-m277.onrender.com"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
