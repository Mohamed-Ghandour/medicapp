package com.medicapp.controller;

import com.medicapp.dto.patient.PatientResponse;
import com.medicapp.dto.rendezvous.RendezVousResponse;
import com.medicapp.service.PatientService;
import com.medicapp.service.RendezVousService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final PatientService patientService;
    private final RendezVousService rendezVousService;

    public PatientController(PatientService patientService, RendezVousService rendezVousService) {
        this.patientService = patientService;
        this.rendezVousService = rendezVousService;
    }

    @GetMapping("/me")
    public PatientResponse myProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return patientService.getMyProfile(userDetails.getUsername());
    }

    @GetMapping("/rendez-vous")
    public List<RendezVousResponse> myAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        return rendezVousService.listForPatient(userDetails.getUsername());
    }
}
