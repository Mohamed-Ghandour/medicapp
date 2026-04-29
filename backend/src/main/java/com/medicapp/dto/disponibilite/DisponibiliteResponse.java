package com.medicapp.dto.disponibilite;

import java.time.LocalTime;

public record DisponibiliteResponse(
        Long id,
        Long medecinId,
        short jour,
        LocalTime heureDebut,
        LocalTime heureFin
) {
}
