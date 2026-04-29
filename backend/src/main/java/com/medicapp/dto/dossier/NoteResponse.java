package com.medicapp.dto.dossier;

import java.time.Instant;

public record NoteResponse(
        Long id,
        String contenu,
        Instant dateCreation
) {
}
