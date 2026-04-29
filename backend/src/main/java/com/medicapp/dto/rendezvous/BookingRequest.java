package com.medicapp.dto.rendezvous;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
        @NotNull Long medecinId,
        @NotNull @FutureOrPresent LocalDate date,
        @NotNull LocalTime heureDebut,
        @NotNull LocalTime heureFin
) {
}
