package com.medicapp.service;

import com.medicapp.dto.patient.PatientResponse;
import com.medicapp.entity.Patient;
import com.medicapp.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public PatientResponse getMyProfile(String username) {
        return patientRepository.findByUserUsername(username)
                .map(PatientService::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));
    }

    static PatientResponse toResponse(Patient p) {
        return new PatientResponse(p.getId(), p.getUser().getUsername(), p.getUser().getEmail(),
                p.getDateNaissance(), p.getTelephone());
    }
}
