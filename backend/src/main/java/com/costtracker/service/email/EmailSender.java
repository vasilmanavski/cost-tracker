package com.costtracker.service.email;

/**
 * Abstraction for sending emails.
 */
public interface EmailSender {

    /**
     * Send an arbitrary email with an HTML body.
     */
    void sendEmail(String to, String subject, String htmlBody);

    /**
     * Send a verification email containing a token-based link.
     */
    void sendVerificationEmail(String to, String token);
}
