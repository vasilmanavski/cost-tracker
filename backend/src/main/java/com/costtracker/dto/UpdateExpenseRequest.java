package com.costtracker.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record UpdateExpenseRequest(
        @NotBlank(message = "Merchant is required")
        String merchant,

        @NotBlank(message = "Description is required")
        @Size(max = 500)
        String description,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        BigDecimal amount,

        @NotBlank(message = "Currency is required")
        @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code")
        String currency,

        @NotBlank(message = "Category is required")
        String category,

        @NotNull(message = "Expense date is required")
        String expenseDate,

        String notes
) {}
