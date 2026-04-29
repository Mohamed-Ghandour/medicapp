package com.medicapp.service;

import com.medicapp.dto.chatbot.AskRequest;
import com.medicapp.dto.chatbot.AskResponse;
import com.medicapp.entity.ChatbotInteraction;
import com.medicapp.repository.ChatbotInteractionRepository;
import com.medicapp.repository.ChatbotServiceRepository;
import com.medicapp.repository.UserRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ChatbotBotService {

    private static final String SERVICE_NAME = "MedicApp Assistant";

    private final ChatbotInteractionRepository interactionRepository;
    private final ChatbotServiceRepository chatbotServiceRepository;
    private final UserRepository userRepository;

    public ChatbotBotService(ChatbotInteractionRepository interactionRepository,
                             ChatbotServiceRepository chatbotServiceRepository,
                             UserRepository userRepository) {
        this.interactionRepository = interactionRepository;
        this.chatbotServiceRepository = chatbotServiceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AskResponse ask(AskRequest request, String username) {
        var service = chatbotServiceRepository.findByNom(SERVICE_NAME)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Chatbot service unavailable"));
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String reponse = buildResponse(request.question().toLowerCase(), user.getRole().name());
        var interaction = interactionRepository.save(
                new ChatbotInteraction(service, user, request.question(), reponse));
        return toResponse(interaction);
    }

    @Transactional(readOnly = true)
    public List<AskResponse> history(String username) {
        return interactionRepository.findByUserUsernameOrderByDateInteractionDesc(username)
                .stream().map(ChatbotBotService::toResponse).toList();
    }

    private static String buildResponse(String q, String role) {
        if (contains(q, "book", "appointment", "rendez-vous", "schedule")) {
            if ("PATIENT".equals(role)) {
                return "To book an appointment: go to **Doctors** in the sidebar, pick a doctor, then click **View Availability** to see open slots and book directly.";
            }
            return "Appointment booking is only available to patients. Doctors can view and manage appointments from the **Appointments** page.";
        }
        if (contains(q, "cancel", "annuler")) {
            return "To cancel an appointment, go to **Appointments**, find the one you want to cancel, and click **Cancel**. Cancellations cannot be undone.";
        }
        if (contains(q, "doctor", "medecin", "médecin", "specialist")) {
            if ("PATIENT".equals(role)) {
                return "Browse all available doctors on the **Doctors** page. You can view their speciality and available time slots before booking.";
            }
            return "Doctors can manage their availability slots from the **Availability** page and review appointments from **Appointments**.";
        }
        if (contains(q, "availability", "disponibilite", "disponibilité", "slot", "time")) {
            return "Doctors set their weekly availability from the **Availability** page. Each slot defines a day of the week and a time range that patients can book within.";
        }
        if (contains(q, "dossier", "record", "medical", "note")) {
            if ("PATIENT".equals(role)) {
                return "Your medical record is in **Medical Record** in the sidebar. It contains all notes written by doctors who have treated you.";
            }
            if ("MEDECIN".equals(role)) {
                return "To add a note to a patient's medical record, use the dossier API endpoint `POST /api/dossier/{dossierId}/notes`. You must have a confirmed appointment with the patient first.";
            }
        }
        if (contains(q, "password", "mot de passe", "login", "account", "compte")) {
            return "If you have trouble logging in, contact your administrator. Patients can register at **/register**. Doctor accounts are created by the administrator.";
        }
        if (contains(q, "admin", "user", "manage")) {
            if ("ADMIN".equals(role)) {
                return "As an admin you can manage users from **Manage Users** and create new doctor accounts from **Create Doctor** in the sidebar.";
            }
        }
        if (contains(q, "hello", "hi", "bonjour", "help", "aide")) {
            return "Hello! I'm the MedicApp assistant. I can help you with:\n- Booking appointments\n- Finding doctors\n- Managing availability\n- Understanding your medical record\n\nWhat would you like to know?";
        }
        return "I'm not sure how to help with that. Try asking about: booking appointments, finding doctors, managing availability, or your medical record.";
    }

    private static boolean contains(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private static AskResponse toResponse(ChatbotInteraction i) {
        return new AskResponse(i.getId(), i.getQuestion(), i.getReponse(), i.getDateInteraction());
    }
}
