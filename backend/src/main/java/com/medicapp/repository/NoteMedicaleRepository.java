package com.medicapp.repository;

import com.medicapp.entity.NoteMedicale;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteMedicaleRepository extends JpaRepository<NoteMedicale, Long> {

    List<NoteMedicale> findByDossierIdOrderByDateCreationDesc(Long dossierId);
}
