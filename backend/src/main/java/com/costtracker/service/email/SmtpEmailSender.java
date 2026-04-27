package com.costtracker.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Sends emails via SMTP using Spring's JavaMailSender.
 * Active only in the "prod" profile.
 * Configure with standard spring.mail.* properties.
 */
@Component
@Profile("prod")
public class SmtpEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(SmtpEmailSender.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String appUrl;

    public SmtpEmailSender(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String fromEmail,
            @Value("${app.url}") String appUrl) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.appUrl = appUrl;
    }

    @Override
    public void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {} [subject={}]", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = appUrl + "/verify-email?token=" + token;
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2>Welcome to Cost Tracker!</h2>
                  <p>Click the button below to verify your email address:</p>
                  <a href="%s"
                     style="display: inline-block; padding: 12px 24px;
                            background-color: #2563eb; color: #fff;
                            text-decoration: none; border-radius: 6px;
                            font-weight: 600;">
                    Verify Email
                  </a>
                  <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
                    If you didn't create an account, you can safely ignore this email.
                  </p>
                </div>
                """.formatted(verifyUrl);
        sendEmail(to, "Verify your Cost Tracker email", html);
    }
}
