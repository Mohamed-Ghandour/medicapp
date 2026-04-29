package com.medicapp.service;

import com.medicapp.dto.rendezvous.BookingRequest;
import com.medicapp.dto.rendezvous.RendezVousResponse;
import com.medicapp.dto.rendezvous.UpdateStatutRequest;
import com.medicapp.entity.RendezVous;
import com.medicapp.entity.RendezVousStatut;
import com.medicapp.repository.DisponibiliteRepository;
import com.medicapp.repository.MedecinRepository;
import com.medicapp.repository.PatientRepository;
import com.medicapp.repository.RendezVousRepository;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final MedecinRepository medecinRepository;
    private final PatientRepository patientRepository;
    private final DisponibiliteRepository disponibiliteRepository;

    public RendezVousService(RendezVousRepository rendezVousRepository,
                             MedecinRepository medecinRepository,
                             PatientRepository patientRepository,
                             DisponibiliteRepository disponibiliteRepository) {
        this.rendezVousRepository = rendezVousRepository;
        this.medecinRepository = medecinRepository;
        this.patientRepository = patientRepository;
        this.disponibiliteRepository = disponibiliteRepository;
    }

    @Transactional
    public RendezVousResponse book(BookingRequest request, String username) {
        if (!request.heureFin().isAfter(request.heureDebut())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "heureFin must be after heureDebut");
        }
        var patient = patientRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));
        var medecin = medecinRepository.findById(request.medecinId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));

        short jour = (short) request.date().getDayOfWeek().getValue();
        disponibiliteRepository.findCoveringSlot(medecin.getId(), jour, request.heureDebut(), request.heureFin())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                        "No availability covers this time slot"));

        var rv = new RendezVous(medecin, patient, request.date(), request.heureDebut(), request.heureFin());
        try {
            rv = rendezVousRepository.saveAndFlush(rv);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctor already has an appointment in this slot");
        }
        return rendezVousRepository.findByIdWithDetails(rv.getId())
                .map(RendezVousService::toResponse)
                .orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<RendezVousResponse> listForPatient(String username) {
        var patient = patientRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));
        return rendezVousRepository.findByPatientIdWithDetails(patient.getId()).stream()
                .map(RendezVousService::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RendezVousResponse> listForMedecin(String username) {
        var medecin = medecinRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor profile not found"));
        return rendezVousRepository.findByMedecinIdWithDetails(medecin.getId()).stream()
                .map(RendezVousService::toResponse)
                .toList();
    }

    @Transactional
    public RendezVousResponse updateStatut(Long id, UpdateStatutRequest request, String username) {
        var rv = rendezVousRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (!rv.getMedecin().getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your appointment");
        }
        rv.setStatut(request.statut());
        return toResponse(rendezVousRepository.save(rv));
    }

    @Transactional
    public void cancel(Long id, String username) {
        var rv = rendezVousRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
        if (!rv.getPatient().getUser().getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your appointment");
        }
        if (rv.getStatut() == RendezVousStatut.ANNULE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Appointment already cancelled");
        }
        rv.setStatut(RendezVousStatut.ANNULE);
        rendezVousRepository.save(rv);
    }

    private static RendezVousResponse toResponse(RendezVous rv) {
        return new RendezVousResponse(
                rv.getId(),
                rv.getMedecin().getId(),
                rv.getMedecin().getUser().getUsername(),
                rv.getPatient().getId(),
                rv.getPatient().getUser().getUsername(),
                rv.getDate(),
                rv.getHeureDebut(),
                rv.getHeureFin(),
                rv.getStatut().name()
        );
    }
}
