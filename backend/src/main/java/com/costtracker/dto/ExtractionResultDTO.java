package com.costtracker.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ExtractionResultDTO(
        String merchant,
        String expenseDate,
        BigDecimal amount,
        String currency,
        String category,
        String description,
        List<LineItemDTO> lineItems,
        String confidence,
        Map<String, String> confidenceDetails,
        String receiptImagePath,
        boolean needsReview,
        List<String> warnings
) {
    public record LineItemDTO(
            String name,
            Integer quantity,
            BigDecimal price
    ) {}
}
