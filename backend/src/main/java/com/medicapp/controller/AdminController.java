package com.medicapp.controller;

import com.medicapp.dto.admin.ResetPasswordRequest;
import com.medicapp.dto.admin.UserResponse;
import com.medicapp.dto.medecin.CreateMedecinRequest;
import com.medicapp.dto.medecin.MedecinResponse;
import com.medicapp.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return adminService.listUsers();
    }

    @PostMapping("/medecins")
    @ResponseStatus(HttpStatus.CREATED)
    public MedecinResponse createMedecin(@Valid @RequestBody CreateMedecinRequest request) {
        return adminService.createMedecin(request);
    }

    @PatchMapping("/users/{id}/disable")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disableUser(@PathVariable Long id) {
        adminService.disableUser(id);
    }

    @PatchMapping("/users/{id}/enable")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void enableUser(@PathVariable Long id) {
        adminService.enableUser(id);
    }

    @PatchMapping("/users/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest request) {
        adminService.resetPassword(id, request);
    }
}
