package com.medicapp.dto.medecin;

public record MedecinResponse(
        Long id,
        String username,
        String email,
        String specialite,
        String numeroOrdre
) {
}
