package com.medicapp.repository;

import com.medicapp.entity.DossierPatient;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DossierPatientRepository extends JpaRepository<DossierPatient, Long> {

    Optional<DossierPatient> findByPatientId(Long patientId);
}
