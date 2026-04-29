package com.medicapp.controller;

import com.medicapp.dto.dossier.AddNoteRequest;
import com.medicapp.dto.dossier.DossierResponse;
import com.medicapp.dto.dossier.NoteResponse;
import com.medicapp.service.DossierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dossier")
public class DossierController {

    private final DossierService dossierService;

    public DossierController(DossierService dossierService) {
        this.dossierService = dossierService;
    }

    @GetMapping("/me")
    public DossierResponse myDossier(@AuthenticationPrincipal UserDetails userDetails) {
        return dossierService.getMyDossier(userDetails.getUsername());
    }

    @GetMapping("/patient/{patientId}")
    public DossierResponse patientDossier(@PathVariable Long patientId,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        return dossierService.getDossierByPatientId(patientId, userDetails.getUsername());
    }

    @PostMapping("/{dossierId}/notes")
    @ResponseStatus(HttpStatus.CREATED)
    public NoteResponse addNote(@PathVariable Long dossierId,
                                @Valid @RequestBody AddNoteRequest request,
                                @AuthenticationPrincipal UserDetails userDetails) {
        return dossierService.addNote(dossierId, request, userDetails.getUsername());
    }
}
