package com.medicapp.service;

import com.medicapp.dto.medecin.MedecinResponse;
import com.medicapp.entity.Medecin;
import com.medicapp.repository.MedecinRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MedecinService {

    private final MedecinRepository medecinRepository;

    public MedecinService(MedecinRepository medecinRepository) {
        this.medecinRepository = medecinRepository;
    }

    @Transactional(readOnly = true)
    public List<MedecinResponse> list() {
        return medecinRepository.findAll().stream()
                .map(MedecinService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedecinResponse getById(Long id) {
        return medecinRepository.findById(id)
                .map(MedecinService::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
    }

    @Transactional(readOnly = true)
    public MedecinResponse getMyProfile(String username) {
        return medecinRepository.findByUserUsername(username)
                .map(MedecinService::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
    }

    static MedecinResponse toResponse(Medecin m) {
        return new MedecinResponse(m.getId(), m.getUser().getUsername(), m.getUser().getEmail(),
                m.getSpecialite(), m.getNumeroOrdre());
    }
}
