package com.medicapp.controller;

import com.medicapp.dto.disponibilite.DisponibiliteRequest;
import com.medicapp.dto.disponibilite.DisponibiliteResponse;
import com.medicapp.service.DisponibiliteService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/disponibilites")
public class DisponibiliteController {

    private final DisponibiliteService disponibiliteService;

    public DisponibiliteController(DisponibiliteService disponibiliteService) {
        this.disponibiliteService = disponibiliteService;
    }

    @GetMapping("/medecin/{medecinId}")
    public List<DisponibiliteResponse> listByMedecin(@PathVariable Long medecinId) {
        return disponibiliteService.listByMedecin(medecinId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DisponibiliteResponse create(@Valid @RequestBody DisponibiliteRequest request,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        return disponibiliteService.create(request, userDetails.getUsername());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        disponibiliteService.delete(id, userDetails.getUsername());
    }
}
