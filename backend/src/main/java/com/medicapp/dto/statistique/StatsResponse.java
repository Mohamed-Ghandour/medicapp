package com.medicapp.dto.statistique;

public record StatsResponse(
        long totalAppointments,
        long pendingAppointments,
        long confirmedAppointments,
        long completedAppointments,
        long cancelledAppointments,
        Long medicalNotes,
        Long totalUsers,
        Long totalDoctors,
        Long totalPatients
) {
}
