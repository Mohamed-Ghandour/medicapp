package com.medicapp.service;

import com.medicapp.dto.admin.ResetPasswordRequest;
import com.medicapp.dto.admin.UserResponse;
import com.medicapp.dto.medecin.CreateMedecinRequest;
import com.medicapp.dto.medecin.MedecinResponse;
import com.medicapp.entity.Medecin;
import com.medicapp.entity.User;
import com.medicapp.entity.UserRole;
import com.medicapp.repository.MedecinRepository;
import com.medicapp.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        MedecinRepository medecinRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.medecinRepository = medecinRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername(), u.getEmail(),
                        u.getRole().name(), u.isEnabled(), u.getCreatedAt()))
                .toList();
    }

    @Transactional
    public MedecinResponse createMedecin(CreateMedecinRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        if (medecinRepository.existsByNumeroOrdre(request.numeroOrdre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Numero d'ordre already registered");
        }
        User user = userRepository.save(new User(
                request.username(), request.email(),
                passwordEncoder.encode(request.password()), UserRole.MEDECIN));
        Medecin medecin = medecinRepository.save(new Medecin(user, request.specialite(), request.numeroOrdre()));
        return MedecinService.toResponse(medecin);
    }

    @Transactional
    public void disableUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.disableById(id);
    }

    @Transactional
    public void enableUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.enableById(id);
    }

    @Transactional
    public void resetPassword(Long id, ResetPasswordRequest request) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.updatePasswordById(id, passwordEncoder.encode(request.newPassword()));
    }
}
