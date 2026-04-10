package com.costtracker.service.email;

/**
 * Abstraction for sending emails. Implementations:
 * - LoggingEmailSender: logs to console (local dev, default)
 * - Future: SmtpEmailSender, SendGridEmailSender, etc.
 */
public interface EmailSender {

    void sendVerificationEmail(String to, String token);
}
