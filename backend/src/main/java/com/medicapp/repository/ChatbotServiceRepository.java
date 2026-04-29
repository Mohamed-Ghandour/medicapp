package com.medicapp.repository;

import com.medicapp.entity.ChatbotServiceEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotServiceRepository extends JpaRepository<ChatbotServiceEntity, Long> {
    Optional<ChatbotServiceEntity> findByNom(String nom);
}
