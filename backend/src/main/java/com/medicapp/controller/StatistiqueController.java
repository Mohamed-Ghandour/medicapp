package com.medicapp.controller;

import com.medicapp.dto.statistique.StatsResponse;
import com.medicapp.service.StatistiqueService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistiques")
public class StatistiqueController {

    private final StatistiqueService statistiqueService;

    public StatistiqueController(StatistiqueService statistiqueService) {
        this.statistiqueService = statistiqueService;
    }

    @GetMapping("/me")
    public StatsResponse myStats(@AuthenticationPrincipal UserDetails userDetails) {
        return statistiqueService.getMyStats(userDetails.getUsername());
    }
}
