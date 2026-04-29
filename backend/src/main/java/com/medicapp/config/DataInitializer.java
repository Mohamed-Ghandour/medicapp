package com.medicapp.config;

import com.medicapp.entity.Administrateur;
import com.medicapp.entity.User;
import com.medicapp.entity.UserRole;
import com.medicapp.repository.AdministrateurRepository;
import com.medicapp.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final AdministrateurRepository administrateurRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AdministrateurRepository administrateurRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.administrateurRepository = administrateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByUsername("admin")) {
            User adminUser = userRepository.save(new User(
                    "admin",
                    "admin@medicapp.local",
                    passwordEncoder.encode("Admin@1234"),
                    UserRole.ADMIN
            ));
            administrateurRepository.save(new Administrateur(adminUser, "FULL"));
        }
    }
}
