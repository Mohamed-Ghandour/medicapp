package com.medicapp.dto.chatbot;

import java.time.Instant;

public record AskResponse(
        Long id,
        String question,
        String reponse,
        Instant dateInteraction
) {
}
