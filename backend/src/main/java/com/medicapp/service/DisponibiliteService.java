package com.medicapp.service;

import com.medicapp.dto.disponibilite.DisponibiliteRequest;
import com.medicapp.dto.disponibilite.DisponibiliteResponse;
import com.medicapp.entity.Disponibilite;
import com.medicapp.repository.DisponibiliteRepository;
import com.medicapp.repository.MedecinRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DisponibiliteService {

    private final DisponibiliteRepository disponibiliteRepository;
    private final MedecinRepository medecinRepository;

    public DisponibiliteService(DisponibiliteRepository disponibiliteRepository,
                                MedecinRepository medecinRepository) {
        this.disponibiliteRepository = disponibiliteRepository;
        this.medecinRepository = medecinRepository;
    }

    public List<DisponibiliteResponse> listByMedecin(Long medecinId) {
        return disponibiliteRepository.findByMedecinId(medecinId).stream()
                .map(DisponibiliteService::toResponse)
                .toList();
    }

    @Transactional
    public DisponibiliteResponse create(DisponibiliteRequest request, String username) {
        if (request.heureFin().isBefore(request.heureDebut()) || request.heureFin().equals(request.heureDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "heureFin must be after heureDebut");
        }
        var medecin = medecinRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
        var slot = new Disponibilite(medecin, request.jour().shortValue(), request.heureDebut(), request.heureFin());
        return toResponse(disponibiliteRepository.save(slot));
    }

    @Transactional
    public void delete(Long id, String username) {
        var slot = disponibiliteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (!slot.getMedecin().getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your slot");
        }
        disponibiliteRepository.delete(slot);
    }

    private static DisponibiliteResponse toResponse(Disponibilite d) {
        return new DisponibiliteResponse(d.getId(), d.getMedecin().getId(), d.getJour(),
                d.getHeureDebut(), d.getHeureFin());
    }
}
