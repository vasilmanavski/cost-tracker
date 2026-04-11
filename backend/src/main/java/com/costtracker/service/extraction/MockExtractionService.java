package com.costtracker.service.extraction;

import com.costtracker.dto.ExtractionResultDTO;
import com.costtracker.dto.ExtractionResultDTO.LineItemDTO;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Returns realistic mock extraction data for development without an API key.
 * This lets the full upload -> review -> save flow work locally.
 */
public class MockExtractionService implements ExtractionService {

    @Override
    public ExtractionResultDTO extract(Path imagePath, String receiptImageRelativePath) {
        return new ExtractionResultDTO(
                "Whole Foods Market",
                LocalDate.now().minusDays(1).toString(),
                new BigDecimal("43.97"),
                "MKD",
                "groceries",
                "Groceries at Whole Foods Market",
                List.of(
                        new LineItemDTO("Organic Bananas", 1, new BigDecimal("2.49")),
                        new LineItemDTO("Sourdough Bread", 1, new BigDecimal("5.99")),
                        new LineItemDTO("Almond Milk", 2, new BigDecimal("4.29")),
                        new LineItemDTO("Mixed Salad Greens", 1, new BigDecimal("3.99"))
                ),
                "HIGH",
                Map.of(
                        "merchant", "HIGH",
                        "date", "HIGH",
                        "amount", "HIGH",
                        "lineItems", "MEDIUM"
                ),
                receiptImageRelativePath,
                false,
                List.of("MOCK: This is simulated extraction data for development.")
        );
    }
}
