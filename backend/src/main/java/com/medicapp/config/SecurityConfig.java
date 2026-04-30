package com.medicapp.config;

import com.medicapp.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthFilter jwtAuthFilter
    ) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.OPTIONS, "/api/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/auth/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/error")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/admin/**")).hasRole("ADMIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/medecins/me")).hasRole("MEDECIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/medecins/rendez-vous")).hasRole("MEDECIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/patient/me")).hasRole("PATIENT")
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/patient/rendez-vous")).hasRole("PATIENT")
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/dossier/me")).hasRole("PATIENT")
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.GET, "/api/dossier/patient/**")).hasRole("MEDECIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/dossier/**")).hasRole("MEDECIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/disponibilites")).hasRole("MEDECIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/disponibilites/**")).hasRole("MEDECIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.POST, "/api/rendez-vous")).hasRole("PATIENT")
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.DELETE, "/api/rendez-vous/**")).hasRole("PATIENT")
                        .requestMatchers(AntPathRequestMatcher.antMatcher(HttpMethod.PATCH, "/api/rendez-vous/**")).hasRole("MEDECIN")
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/statistiques/**")).authenticated()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/chatbot/**")).authenticated()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
