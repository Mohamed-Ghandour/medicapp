package com.medicapp.service;

import com.medicapp.dto.auth.LoginRequest;
import com.medicapp.dto.auth.RegisterRequest;
import com.medicapp.dto.auth.TokenResponse;
import com.medicapp.entity.DossierPatient;
import com.medicapp.entity.Patient;
import com.medicapp.entity.User;
import com.medicapp.entity.UserRole;
import com.medicapp.repository.DossierPatientRepository;
import com.medicapp.repository.PatientRepository;
import com.medicapp.repository.UserRepository;
import com.medicapp.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DossierPatientRepository dossierPatientRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public AuthService(
            UserRepository userRepository,
            PatientRepository patientRepository,
            DossierPatientRepository dossierPatientRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserDetailsService userDetailsService
    ) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.dossierPatientRepository = dossierPatientRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User user = new User(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                UserRole.PATIENT
        );
        user = userRepository.save(user);
        Patient patient = new Patient(user, request.dateNaissance(), request.telephone());
        patient = patientRepository.save(patient);
        dossierPatientRepository.save(new DossierPatient(patient));
        return tokenResponseForUsername(user.getUsername());
    }

    public TokenResponse login(LoginRequest request) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        return tokensFromAuth(auth);
    }

    public TokenResponse refresh(String refreshToken) {
        String username = jwtService.parseRefreshUsername(refreshToken);
        return tokenResponseForUsername(username);
    }

    private TokenResponse tokenResponseForUsername(String username) {
        UserDetails details = userDetailsService.loadUserByUsername(username);
        var auth = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
        return tokensFromAuth(auth);
    }

    private TokenResponse tokensFromAuth(org.springframework.security.core.Authentication auth) {
        String role = auth.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse(UserRole.PATIENT.name());
        String access = jwtService.createAccessToken(auth);
        String refresh = jwtService.createRefreshToken(auth.getName());
        return new TokenResponse(access, refresh, jwtService.accessTokenTtlSeconds(), role);
    }
}
