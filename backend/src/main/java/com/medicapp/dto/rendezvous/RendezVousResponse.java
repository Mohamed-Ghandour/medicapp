package com.medicapp.dto.rendezvous;

import java.time.LocalDate;
import java.time.LocalTime;

public record RendezVousResponse(
        Long id,
        Long medecinId,
        String medecinUsername,
        Long patientId,
        String patientUsername,
        LocalDate date,
        LocalTime heureDebut,
        LocalTime heureFin,
        String statut
) {
}
