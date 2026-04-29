package com.medicapp.dto.dossier;

import java.time.Instant;
import java.util.List;

public record DossierResponse(
        Long id,
        Long patientId,
        Instant dateCreation,
        List<NoteResponse> notes
) {
}
