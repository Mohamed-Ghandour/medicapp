package com.medicapp.repository;

import com.medicapp.entity.Medecin;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedecinRepository extends JpaRepository<Medecin, Long> {

    Optional<Medecin> findByUserUsername(String username);

    boolean existsByNumeroOrdre(String numeroOrdre);
}
