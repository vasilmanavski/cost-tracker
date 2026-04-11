package com.costtracker.service.extraction;

import com.costtracker.dto.ExtractionResultDTO;
import com.costtracker.dto.ExtractionResultDTO.LineItemDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.*;

/**
 * Calls OpenAI GPT-4o vision API to extract structured data from a receipt image.
 * Requires OPENAI_API_KEY environment variable to be set.
 * <p>
 * Sends the image as a base64 data URL in a chat completion request with a structured
 * prompt. Parses the JSON response into ExtractionResultDTO. On failure, returns a
 * low-confidence result with needsReview=true so the user can fill in fields manually.
 */
public class OpenAiExtractionService implements ExtractionService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiExtractionService.class);
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    private final String apiKey;
    private final String model;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiExtractionService(String apiKey, String model) {
        this.apiKey = apiKey;
        this.model = model;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public ExtractionResultDTO extract(Path imagePath, String receiptImageRelativePath) {
        try {
            byte[] imageBytes = Files.readAllBytes(imagePath);
            String mimeType = detectMimeType(imagePath);
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String dataUrl = "data:" + mimeType + ";base64," + base64Image;

            String requestBody = buildRequestBody(dataUrl);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(60))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            log.info("Sending receipt image to OpenAI ({} model, {} KB image)",
                    model, imageBytes.length / 1024);

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("OpenAI API returned status {}: {}", response.statusCode(), response.body());
                return fallbackResult(receiptImageRelativePath,
                        "OpenAI API error (HTTP " + response.statusCode() + "). Please fill in fields manually.");
            }

            return parseResponse(response.body(), receiptImageRelativePath);

        } catch (IOException | InterruptedException e) {
            log.error("Failed to call OpenAI API", e);
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return fallbackResult(receiptImageRelativePath,
                    "Failed to connect to OpenAI API. Please fill in fields manually.");
        }
    }

    private String buildRequestBody(String dataUrl) throws IOException {
        // Build the JSON request manually to avoid needing a DTO for OpenAI's schema
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        body.put("max_tokens", 1500);
        body.put("response_format", Map.of("type", "json_object"));

        List<Map<String, Object>> messages = new ArrayList<>();

        // System message with extraction instructions
        messages.add(Map.of(
                "role", "system",
                "content", SYSTEM_PROMPT
        ));

        // User message with the image
        List<Map<String, Object>> contentParts = new ArrayList<>();
        contentParts.add(Map.of(
                "type", "text",
                "text", "Extract the receipt data from this image. Return ONLY a JSON object."
        ));
        contentParts.add(Map.of(
                "type", "image_url",
                "image_url", Map.of("url", dataUrl, "detail", "high")
        ));

        messages.add(Map.of(
                "role", "user",
                "content", contentParts
        ));

        body.put("messages", messages);

        return objectMapper.writeValueAsString(body);
    }

    private ExtractionResultDTO parseResponse(String responseBody, String receiptImageRelativePath) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.path("choices");
            if (choices.isEmpty() || choices.get(0).path("message").path("content").isMissingNode()) {
                log.error("Unexpected OpenAI response structure: {}", responseBody);
                return fallbackResult(receiptImageRelativePath, "Unexpected API response format.");
            }

            String content = choices.get(0).path("message").path("content").asText();
            log.debug("OpenAI extraction response: {}", content);

            JsonNode data = objectMapper.readTree(content);

            // Parse fields with null safety
            String merchant = textOrNull(data, "merchant");
            String expenseDate = textOrNull(data, "date");
            BigDecimal amount = decimalOrNull(data, "amount");
            String currency = textOrDefault(data, "currency", "MKD");
            String category = textOrDefault(data, "category", "other");
            String description = textOrNull(data, "description");

            // Parse line items
            List<LineItemDTO> lineItems = new ArrayList<>();
            JsonNode itemsNode = data.path("lineItems");
            if (itemsNode.isArray()) {
                for (JsonNode item : itemsNode) {
                    lineItems.add(new LineItemDTO(
                            textOrDefault(item, "name", "Unknown item"),
                            item.has("quantity") && !item.get("quantity").isNull()
                                    ? item.get("quantity").asInt(1) : 1,
                            decimalOrNull(item, "price")
                    ));
                }
            }

            // Parse confidence
            String confidence = textOrDefault(data, "confidence", "MEDIUM");
            Map<String, String> confidenceDetails = new LinkedHashMap<>();
            JsonNode detailsNode = data.path("confidenceDetails");
            if (detailsNode.isObject()) {
                detailsNode.fields().forEachRemaining(entry ->
                        confidenceDetails.put(entry.getKey(), entry.getValue().asText("MEDIUM")));
            } else {
                // Default all to same as overall confidence
                confidenceDetails.put("merchant", confidence);
                confidenceDetails.put("date", confidence);
                confidenceDetails.put("amount", confidence);
                confidenceDetails.put("lineItems", confidence);
            }

            boolean needsReview = data.has("needsReview")
                    ? data.get("needsReview").asBoolean(true)
                    : !"HIGH".equals(confidence);

            // Collect warnings
            List<String> warnings = new ArrayList<>();
            JsonNode warningsNode = data.path("warnings");
            if (warningsNode.isArray()) {
                for (JsonNode w : warningsNode) {
                    warnings.add(w.asText());
                }
            }
            if (merchant == null) warnings.add("Could not detect merchant name.");
            if (amount == null) warnings.add("Could not detect total amount.");
            if (expenseDate == null) warnings.add("Could not detect date.");

            // Validate category against known categories
            category = normalizeCategory(category);

            // Generate description if missing
            if (description == null || description.isBlank()) {
                description = generateDescription(merchant, category);
            }

            log.info("Receipt extracted: merchant={}, amount={}, category={}, confidence={}",
                    merchant, amount, category, confidence);

            return new ExtractionResultDTO(
                    merchant,
                    expenseDate,
                    amount,
                    currency,
                    category,
                    description,
                    lineItems,
                    confidence,
                    confidenceDetails,
                    receiptImageRelativePath,
                    needsReview,
                    warnings
            );

        } catch (Exception e) {
            log.error("Failed to parse OpenAI extraction response", e);
            return fallbackResult(receiptImageRelativePath,
                    "Failed to parse AI extraction result. Please fill in fields manually.");
        }
    }

    // ---- Helpers ----

    private ExtractionResultDTO fallbackResult(String receiptImageRelativePath, String warning) {
        return new ExtractionResultDTO(
                null, null, null, "MKD", "other",
                null, List.of(), "LOW",
                Map.of("merchant", "LOW", "date", "LOW", "amount", "LOW", "lineItems", "LOW"),
                receiptImageRelativePath, true,
                List.of(warning)
        );
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || value.asText().isBlank()) return null;
        return value.asText().trim();
    }

    private static String textOrDefault(JsonNode node, String field, String defaultValue) {
        String value = textOrNull(node, field);
        return value != null ? value : defaultValue;
    }

    private static BigDecimal decimalOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) return null;
        try {
            if (value.isNumber()) return value.decimalValue();
            return new BigDecimal(value.asText().replaceAll("[^\\d.]", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String detectMimeType(Path path) {
        String name = path.getFileName().toString().toLowerCase();
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".webp")) return "image/webp";
        return "image/jpeg"; // default
    }

    private static final Set<String> VALID_CATEGORIES = Set.of(
            "groceries", "restaurants", "coffee", "transport", "bills",
            "shopping", "health", "entertainment", "travel", "subscriptions", "other"
    );

    private static String normalizeCategory(String category) {
        if (category == null) return "other";
        String lower = category.toLowerCase().trim();
        // Handle common aliases
        if (lower.contains("grocery") || lower.contains("supermarket") || lower.contains("food market")) {
            return "groceries";
        }
        if (lower.contains("restaurant") || lower.contains("dining") || lower.contains("fast food")) {
            return "restaurants";
        }
        if (lower.contains("cafe") || lower.contains("coffee") || lower.contains("starbucks")) {
            return "coffee";
        }
        if (lower.contains("uber") || lower.contains("lyft") || lower.contains("taxi") || lower.contains("gas")
                || lower.contains("parking") || lower.contains("transit")) {
            return "transport";
        }
        if (lower.contains("pharmacy") || lower.contains("doctor") || lower.contains("medical")
                || lower.contains("hospital")) {
            return "health";
        }
        if (VALID_CATEGORIES.contains(lower)) return lower;
        return "other";
    }

    private static String generateDescription(String merchant, String category) {
        if (merchant != null && !merchant.isBlank()) {
            String categoryLabel = category.substring(0, 1).toUpperCase() + category.substring(1);
            return categoryLabel + " at " + merchant;
        }
        return "Receipt expense";
    }

    // ---- Prompt ----

    private static final String SYSTEM_PROMPT = """
            You are a receipt data extraction assistant. Analyze the receipt image and extract structured data.
            
            Return a JSON object with these exact fields:
            {
              "merchant": "Store/restaurant name (string or null if unreadable)",
              "date": "YYYY-MM-DD format (string or null if unreadable)",
              "amount": total amount as a number (the final total including tax, or null),
              "currency": "3-letter currency code, default MKD",
              "category": "one of: groceries, restaurants, coffee, transport, bills, shopping, health, entertainment, travel, subscriptions, other",
              "description": "Brief 3-8 word description of the purchase",
              "lineItems": [
                {"name": "Item name", "quantity": 1, "price": 2.99}
              ],
              "confidence": "HIGH, MEDIUM, or LOW — overall extraction confidence",
              "confidenceDetails": {
                "merchant": "HIGH/MEDIUM/LOW",
                "date": "HIGH/MEDIUM/LOW",
                "amount": "HIGH/MEDIUM/LOW",
                "lineItems": "HIGH/MEDIUM/LOW"
              },
              "needsReview": true/false,
              "warnings": ["any notes about uncertain extractions"]
            }
            
            Rules:
            - NEVER fabricate data. If you cannot read a field, set it to null.
            - "amount" must be the grand total (including tax), not the subtotal.
            - For "date", use YYYY-MM-DD format. If only month/day visible, assume current year.
            - For "category", pick the single best match from the allowed list.
            - Set "needsReview" to true if any field has LOW confidence or any field is null.
            - Set confidence to HIGH only if all key fields (merchant, date, amount) are clearly readable.
            - Keep line items faithful to what you see — omit items you're unsure about rather than guessing.
            - Return ONLY the JSON object, no markdown fences, no extra text.
            """;
}
