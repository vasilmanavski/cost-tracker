package com.costtracker.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Development email sender that logs emails to the console.
 * Active when the "prod" profile is NOT active.
 */
@Component
@Profile("!prod")
public class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    @Override
    public void sendEmail(String to, String subject, String htmlBody) {
        log.info("========================================");
        log.info("EMAIL (dev mode)");
        log.info("To: {}", to);
        log.info("Subject: {}", subject);
        log.info("Body: {}", htmlBody);
        log.info("========================================");
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        log.info("========================================");
        log.info("EMAIL VERIFICATION (dev mode)");
        log.info("To: {}", to);
        log.info("Token: {}", token);
        log.info("Verify URL: http://localhost:5173/verify-email?token={}", token);
        log.info("========================================");
    }
}
