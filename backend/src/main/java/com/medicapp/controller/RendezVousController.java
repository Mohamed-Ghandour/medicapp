package com.medicapp.controller;

import com.medicapp.dto.rendezvous.BookingRequest;
import com.medicapp.dto.rendezvous.RendezVousResponse;
import com.medicapp.dto.rendezvous.UpdateStatutRequest;
import com.medicapp.service.RendezVousService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rendez-vous")
public class RendezVousController {

    private final RendezVousService rendezVousService;

    public RendezVousController(RendezVousService rendezVousService) {
        this.rendezVousService = rendezVousService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RendezVousResponse book(@Valid @RequestBody BookingRequest request,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        return rendezVousService.book(request, userDetails.getUsername());
    }

    @PatchMapping("/{id}/statut")
    public RendezVousResponse updateStatut(@PathVariable Long id,
                                           @Valid @RequestBody UpdateStatutRequest request,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        return rendezVousService.updateStatut(id, request, userDetails.getUsername());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        rendezVousService.cancel(id, userDetails.getUsername());
    }
}
