package com.medicapp.service;

import com.medicapp.dto.dossier.AddNoteRequest;
import com.medicapp.dto.dossier.DossierResponse;
import com.medicapp.dto.dossier.NoteResponse;
import com.medicapp.entity.NoteMedicale;
import com.medicapp.entity.RendezVousStatut;
import com.medicapp.repository.DossierPatientRepository;
import com.medicapp.repository.NoteMedicaleRepository;
import com.medicapp.repository.PatientRepository;
import com.medicapp.repository.RendezVousRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DossierService {

    private final DossierPatientRepository dossierRepository;
    private final PatientRepository patientRepository;
    private final NoteMedicaleRepository noteRepository;
    private final RendezVousRepository rendezVousRepository;

    public DossierService(DossierPatientRepository dossierRepository,
                          PatientRepository patientRepository,
                          NoteMedicaleRepository noteRepository,
                          RendezVousRepository rendezVousRepository) {
        this.dossierRepository = dossierRepository;
        this.patientRepository = patientRepository;
        this.noteRepository = noteRepository;
        this.rendezVousRepository = rendezVousRepository;
    }

    @Transactional(readOnly = true)
    public DossierResponse getMyDossier(String username) {
        var patient = patientRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));
        var dossier = dossierRepository.findByPatientId(patient.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dossier not found"));
        List<NoteResponse> notes = noteRepository.findByDossierIdOrderByDateCreationDesc(dossier.getId()).stream()
                .map(n -> new NoteResponse(n.getId(), n.getContenu(), n.getDateCreation()))
                .toList();
        return new DossierResponse(dossier.getId(), patient.getId(), dossier.getDateCreation(), notes);
    }

    @Transactional(readOnly = true)
    public DossierResponse getDossierByPatientId(Long patientId, String medecinUsername) {
        boolean hasAppointment = rendezVousRepository.existsByMedecinUserUsernameAndPatientIdAndStatutIn(
                medecinUsername, patientId,
                List.of(RendezVousStatut.CONFIRME, RendezVousStatut.TERMINE));
        if (!hasAppointment) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You have no confirmed or completed appointment with this patient");
        }
        var dossier = dossierRepository.findByPatientId(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dossier not found"));
        List<NoteResponse> notes = noteRepository.findByDossierIdOrderByDateCreationDesc(dossier.getId()).stream()
                .map(n -> new NoteResponse(n.getId(), n.getContenu(), n.getDateCreation()))
                .toList();
        return new DossierResponse(dossier.getId(), patientId, dossier.getDateCreation(), notes);
    }

    @Transactional
    public NoteResponse addNote(Long dossierId, AddNoteRequest request, String medecinUsername) {
        var dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dossier not found"));
        Long patientId = dossier.getPatient().getId();
        boolean hasAppointment = rendezVousRepository.existsByMedecinUserUsernameAndPatientIdAndStatutIn(
                medecinUsername, patientId,
                List.of(RendezVousStatut.CONFIRME, RendezVousStatut.TERMINE));
        if (!hasAppointment) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You have no confirmed or completed appointment with this patient");
        }
        var note = noteRepository.save(new NoteMedicale(dossier, request.contenu()));
        return new NoteResponse(note.getId(), note.getContenu(), note.getDateCreation());
    }
}
