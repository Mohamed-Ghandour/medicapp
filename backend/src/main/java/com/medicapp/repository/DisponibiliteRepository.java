package com.medicapp.repository;

import com.medicapp.entity.Disponibilite;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {

    List<Disponibilite> findByMedecinId(Long medecinId);

    @Query("SELECT d FROM Disponibilite d WHERE d.medecin.id = :medecinId AND d.jour = :jour " +
           "AND d.heureDebut <= :heureDebut AND d.heureFin >= :heureFin")
    Optional<Disponibilite> findCoveringSlot(
            @Param("medecinId") Long medecinId,
            @Param("jour") short jour,
            @Param("heureDebut") LocalTime heureDebut,
            @Param("heureFin") LocalTime heureFin
    );
}
