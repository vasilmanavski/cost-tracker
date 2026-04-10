package com.costtracker.config;

import com.costtracker.service.extraction.ExtractionService;
import com.costtracker.service.extraction.MockExtractionService;
import com.costtracker.service.extraction.OpenAiExtractionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ExtractionConfig {

    private static final Logger log = LoggerFactory.getLogger(ExtractionConfig.class);

    @Value("${app.openai.api-key:}")
    private String apiKey;

    @Value("${app.openai.model:gpt-4o}")
    private String model;

    @Bean
    public ExtractionService extractionService() {
        if (apiKey != null && !apiKey.isBlank()) {
            log.info("OpenAI API key configured — using real extraction service (model: {})", model);
            return new OpenAiExtractionService(apiKey, model);
        } else {
            log.info("No OpenAI API key — using mock extraction service");
            return new MockExtractionService();
        }
    }
}
