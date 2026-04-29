package com.medicapp.dto.rendezvous;

import com.medicapp.entity.RendezVousStatut;
import jakarta.validation.constraints.NotNull;

public record UpdateStatutRequest(
        @NotNull RendezVousStatut statut
) {
}
