package com.medicapp.dto.patient;

import java.time.LocalDate;

public record PatientResponse(
        Long id,
        String username,
        String email,
        LocalDate dateNaissance,
        String telephone
) {
}
