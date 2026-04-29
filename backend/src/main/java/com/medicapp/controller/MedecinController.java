package com.medicapp.controller;

import com.medicapp.dto.medecin.MedecinResponse;
import com.medicapp.dto.rendezvous.RendezVousResponse;
import com.medicapp.service.MedecinService;
import com.medicapp.service.RendezVousService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/medecins")
public class MedecinController {

    private final MedecinService medecinService;
    private final RendezVousService rendezVousService;

    public MedecinController(MedecinService medecinService, RendezVousService rendezVousService) {
        this.medecinService = medecinService;
        this.rendezVousService = rendezVousService;
    }

    @GetMapping
    public List<MedecinResponse> list() {
        return medecinService.list();
    }

    @GetMapping("/me")
    public MedecinResponse myProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return medecinService.getMyProfile(userDetails.getUsername());
    }

    @GetMapping("/rendez-vous")
    public List<RendezVousResponse> myAppointments(@AuthenticationPrincipal UserDetails userDetails) {
        return rendezVousService.listForMedecin(userDetails.getUsername());
    }

    @GetMapping("/{id}")
    public MedecinResponse getById(@PathVariable Long id) {
        return medecinService.getById(id);
    }
}
