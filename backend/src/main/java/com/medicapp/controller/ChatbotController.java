package com.medicapp.controller;

import com.medicapp.dto.chatbot.AskRequest;
import com.medicapp.dto.chatbot.AskResponse;
import com.medicapp.service.ChatbotBotService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotBotService chatbotBotService;

    public ChatbotController(ChatbotBotService chatbotBotService) {
        this.chatbotBotService = chatbotBotService;
    }

    @PostMapping("/ask")
    public AskResponse ask(@Valid @RequestBody AskRequest request,
                           @AuthenticationPrincipal UserDetails userDetails) {
        return chatbotBotService.ask(request, userDetails.getUsername());
    }

    @GetMapping("/history")
    public List<AskResponse> history(@AuthenticationPrincipal UserDetails userDetails) {
        return chatbotBotService.history(userDetails.getUsername());
    }
}
