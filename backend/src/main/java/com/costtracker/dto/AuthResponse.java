package com.costtracker.dto;

public record AuthResponse(
        String token,
        UserInfo user
) {
    public record UserInfo(
            Long id,
            String email,
            String displayName,
            boolean emailVerified
    ) {}
}
