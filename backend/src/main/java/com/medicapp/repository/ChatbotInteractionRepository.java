package com.medicapp.repository;

import com.medicapp.entity.ChatbotInteraction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatbotInteractionRepository extends JpaRepository<ChatbotInteraction, Long> {
    List<ChatbotInteraction> findByUserUsernameOrderByDateInteractionDesc(String username);
}
