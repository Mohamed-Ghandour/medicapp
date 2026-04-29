package com.medicapp.service;

import com.medicapp.dto.statistique.StatsResponse;
import com.medicapp.entity.RendezVousStatut;
import com.medicapp.entity.UserRole;
import com.medicapp.repository.StatistiqueRepository;
import com.medicapp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StatistiqueService {

    private final StatistiqueRepository statistiqueRepository;
    private final UserRepository userRepository;

    public StatistiqueService(StatistiqueRepository statistiqueRepository,
                              UserRepository userRepository) {
        this.statistiqueRepository = statistiqueRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public StatsResponse getMyStats(String username) {
        var user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == UserRole.PATIENT) {
            return new StatsResponse(
                    statistiqueRepository.countAppointmentsByPatientUsername(username),
                    statistiqueRepository.countByPatientUsernameAndStatut(username, RendezVousStatut.EN_ATTENTE),
                    statistiqueRepository.countByPatientUsernameAndStatut(username, RendezVousStatut.CONFIRME),
                    statistiqueRepository.countByPatientUsernameAndStatut(username, RendezVousStatut.TERMINE),
                    statistiqueRepository.countByPatientUsernameAndStatut(username, RendezVousStatut.ANNULE),
                    statistiqueRepository.countNotesByPatientUsername(username),
                    null,
                    null,
                    null
            );
        } else if (user.getRole() == UserRole.MEDECIN) {
            return new StatsResponse(
                    statistiqueRepository.countAppointmentsByMedecinUsername(username),
                    statistiqueRepository.countByMedecinUsernameAndStatut(username, RendezVousStatut.EN_ATTENTE),
                    statistiqueRepository.countByMedecinUsernameAndStatut(username, RendezVousStatut.CONFIRME),
                    statistiqueRepository.countByMedecinUsernameAndStatut(username, RendezVousStatut.TERMINE),
                    statistiqueRepository.countByMedecinUsernameAndStatut(username, RendezVousStatut.ANNULE),
                    null,
                    null,
                    null,
                    null
            );
        } else {
            return new StatsResponse(
                    statistiqueRepository.countAllAppointments(),
                    statistiqueRepository.countAllByStatut(RendezVousStatut.EN_ATTENTE),
                    statistiqueRepository.countAllByStatut(RendezVousStatut.CONFIRME),
                    statistiqueRepository.countAllByStatut(RendezVousStatut.TERMINE),
                    statistiqueRepository.countAllByStatut(RendezVousStatut.ANNULE),
                    null,
                    statistiqueRepository.countAllUsers(),
                    statistiqueRepository.countUsersByRole(UserRole.MEDECIN),
                    statistiqueRepository.countUsersByRole(UserRole.PATIENT)
            );
        }
    }
}
