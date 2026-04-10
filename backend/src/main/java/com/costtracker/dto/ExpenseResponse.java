package com.costtracker.dto;

import com.costtracker.model.Expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ExpenseResponse(
        Long id,
        String merchant,
        String description,
        BigDecimal amount,
        String currency,
        String category,
        LocalDate expenseDate,
        String sourceType,
        String receiptImagePath,
        String lineItemsJson,
        String extractionConfidence,
        boolean needsReview,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ExpenseResponse from(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getMerchant(),
                e.getDescription(),
                e.getAmount(),
                e.getCurrency(),
                e.getCategory(),
                e.getExpenseDate(),
                e.getSourceType(),
                e.getReceiptImagePath(),
                e.getLineItemsJson(),
                e.getExtractionConfidence(),
                e.isNeedsReview(),
                e.getNotes(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
