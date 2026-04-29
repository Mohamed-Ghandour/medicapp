package com.medicapp.dto.dossier;

import jakarta.validation.constraints.NotBlank;

public record AddNoteRequest(
        @NotBlank String contenu
) {
}
