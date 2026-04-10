package com.costtracker.security;

import com.costtracker.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utility to extract the authenticated user from SecurityContext.
 */
public final class AuthUtil {

    private AuthUtil() {}

    /**
     * Returns the currently authenticated User entity.
     * @throws IllegalStateException if no user is authenticated
     */
    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            throw new IllegalStateException("No authenticated user");
        }
        return (User) auth.getPrincipal();
    }

    /**
     * Returns the ID of the currently authenticated user.
     */
    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
