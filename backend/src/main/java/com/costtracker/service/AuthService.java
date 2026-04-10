package com.costtracker.service;

import com.costtracker.dto.AuthResponse;
import com.costtracker.dto.LoginRequest;
import com.costtracker.dto.RegisterRequest;
import com.costtracker.model.EmailVerificationToken;
import com.costtracker.model.User;
import com.costtracker.repository.EmailVerificationTokenRepository;
import com.costtracker.repository.UserRepository;
import com.costtracker.security.GoogleTokenVerifierService;
import com.costtracker.security.JwtService;
import com.costtracker.service.email.EmailSender;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailSender emailSender;
    private final GoogleTokenVerifierService googleTokenVerifier;

    public AuthService(UserRepository userRepository,
                       EmailVerificationTokenRepository tokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       EmailSender emailSender,
                       GoogleTokenVerifierService googleTokenVerifier) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailSender = emailSender;
        this.googleTokenVerifier = googleTokenVerifier;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.email().toLowerCase())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        // Create user
        User user = new User();
        user.setEmail(request.email().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setAuthProvider("LOCAL");
        user.setEmailVerified(false);
        user.setEnabled(true);

        user = userRepository.save(user);

        // Generate verification token
        String tokenValue = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(tokenValue);
        verificationToken.setExpiresAt(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        // Send verification email
        emailSender.sendVerificationEmail(user.getEmail(), tokenValue);

        // Return JWT so the user can access the app (but unverified status is visible)
        // Login will be blocked for unverified users — this token is only returned at registration
        // so the frontend can show the "check your email" state
        String jwt = jwtService.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(jwt, toUserInfo(user));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // User must have a password to login with email/password
        // (GOOGLE-only users have no password)
        if (user.getPasswordHash() == null) {
            throw new IllegalArgumentException("This account uses Google sign-in. Please use the Google button.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("This account has been disabled");
        }

        String jwt = jwtService.generateToken(user.getId(), user.getEmail());

        return new AuthResponse(jwt, toUserInfo(user));
    }

    /**
     * Authenticate via Google ID token.
     *
     * Account linking rules:
     * 1. No user with this email exists → create new GOOGLE user (emailVerified=true, googleLinked=true)
     * 2. LOCAL user exists → link Google (set googleLinked=true, emailVerified=true if not already)
     * 3. Already-linked user → just log in
     */
    @Transactional
    public AuthResponse googleLogin(String idTokenString) {
        // Verify the Google ID token
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(idTokenString);
        if (payload == null) {
            throw new IllegalArgumentException("Invalid Google credential");
        }

        String email = payload.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account has no email");
        }

        Boolean emailVerified = payload.getEmailVerified();
        if (emailVerified == null || !emailVerified) {
            throw new IllegalArgumentException("Google account email is not verified");
        }

        String name = (String) payload.get("name");
        email = email.toLowerCase().trim();

        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;
        if (existingUser.isPresent()) {
            // Existing user — link Google if not already linked
            user = existingUser.get();

            if (!user.isEnabled()) {
                throw new IllegalArgumentException("This account has been disabled");
            }

            if (!user.isGoogleLinked()) {
                user.setGoogleLinked(true);
                // Google verifies email — mark as verified if not already
                if (!user.isEmailVerified()) {
                    user.setEmailVerified(true);
                }
                // Update display name if the user doesn't have one
                if (user.getDisplayName() == null || user.getDisplayName().isBlank()) {
                    user.setDisplayName(name);
                }
                user = userRepository.save(user);
            }
        } else {
            // New user — create GOOGLE account
            user = new User();
            user.setEmail(email);
            user.setDisplayName(name);
            user.setAuthProvider("GOOGLE");
            user.setEmailVerified(true);
            user.setGoogleLinked(true);
            user.setEnabled(true);
            // No password — GOOGLE-only user
            user = userRepository.save(user);
        }

        String jwt = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(jwt, toUserInfo(user));
    }

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (verificationToken.isUsed()) {
            throw new IllegalArgumentException("This verification link has already been used");
        }

        if (verificationToken.isExpired()) {
            throw new IllegalArgumentException("This verification link has expired. Please register again.");
        }

        // Mark token as used
        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);

        // Mark user as verified
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email is already verified");
        }

        // Generate new token
        String tokenValue = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(tokenValue);
        verificationToken.setExpiresAt(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        emailSender.sendVerificationEmail(user.getEmail(), tokenValue);
    }

    private AuthResponse.UserInfo toUserInfo(User user) {
        return new AuthResponse.UserInfo(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.isEmailVerified()
        );
    }
}
