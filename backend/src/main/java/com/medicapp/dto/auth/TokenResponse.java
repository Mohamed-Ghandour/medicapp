package com.medicapp.dto.auth;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long expiresInSeconds,
        String role
) {
}
