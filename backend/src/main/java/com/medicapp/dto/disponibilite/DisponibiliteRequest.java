package com.medicapp.dto.disponibilite;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record DisponibiliteRequest(
        @NotNull @Min(1) @Max(7) Short jour,
        @NotNull LocalTime heureDebut,
        @NotNull LocalTime heureFin
) {
}
