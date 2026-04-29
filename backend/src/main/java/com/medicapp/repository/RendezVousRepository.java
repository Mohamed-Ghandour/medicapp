package com.medicapp.repository;

import com.medicapp.entity.RendezVous;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    @Query("SELECT rv FROM RendezVous rv JOIN FETCH rv.medecin m JOIN FETCH m.user " +
           "JOIN FETCH rv.patient p JOIN FETCH p.user WHERE rv.patient.id = :patientId")
    List<RendezVous> findByPatientIdWithDetails(@Param("patientId") Long patientId);

    @Query("SELECT rv FROM RendezVous rv JOIN FETCH rv.medecin m JOIN FETCH m.user " +
           "JOIN FETCH rv.patient p JOIN FETCH p.user WHERE rv.medecin.id = :medecinId")
    List<RendezVous> findByMedecinIdWithDetails(@Param("medecinId") Long medecinId);

    @Query("SELECT rv FROM RendezVous rv JOIN FETCH rv.medecin m JOIN FETCH m.user " +
           "JOIN FETCH rv.patient p JOIN FETCH p.user WHERE rv.id = :id")
    Optional<RendezVous> findByIdWithDetails(@Param("id") Long id);

    boolean existsByMedecinUserUsernameAndPatientIdAndStatutIn(
            String medecinUsername, Long patientId,
            java.util.List<com.medicapp.entity.RendezVousStatut> statuts);
}
