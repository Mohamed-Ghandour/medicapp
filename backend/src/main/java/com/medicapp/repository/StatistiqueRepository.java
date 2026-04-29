package com.medicapp.repository;

import com.medicapp.entity.RendezVousStatut;
import com.medicapp.entity.Statistique;
import com.medicapp.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StatistiqueRepository extends JpaRepository<Statistique, Long> {

    // ── Patient ──────────────────────────────────────────────────────────────
    @Query("SELECT COUNT(rv) FROM RendezVous rv WHERE rv.patient.user.username = :username")
    long countAppointmentsByPatientUsername(@Param("username") String username);

    @Query("SELECT COUNT(rv) FROM RendezVous rv WHERE rv.patient.user.username = :username AND rv.statut = :statut")
    long countByPatientUsernameAndStatut(@Param("username") String username, @Param("statut") RendezVousStatut statut);

    @Query("SELECT COUNT(n) FROM NoteMedicale n JOIN n.dossier d WHERE d.patient.user.username = :username")
    long countNotesByPatientUsername(@Param("username") String username);

    // ── Doctor ───────────────────────────────────────────────────────────────
    @Query("SELECT COUNT(rv) FROM RendezVous rv WHERE rv.medecin.user.username = :username")
    long countAppointmentsByMedecinUsername(@Param("username") String username);

    @Query("SELECT COUNT(rv) FROM RendezVous rv WHERE rv.medecin.user.username = :username AND rv.statut = :statut")
    long countByMedecinUsernameAndStatut(@Param("username") String username, @Param("statut") RendezVousStatut statut);

    // ── System-wide (Admin) ──────────────────────────────────────────────────
    @Query("SELECT COUNT(rv) FROM RendezVous rv")
    long countAllAppointments();

    @Query("SELECT COUNT(rv) FROM RendezVous rv WHERE rv.statut = :statut")
    long countAllByStatut(@Param("statut") RendezVousStatut statut);

    @Query("SELECT COUNT(u) FROM User u")
    long countAllUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countUsersByRole(@Param("role") UserRole role);
}
