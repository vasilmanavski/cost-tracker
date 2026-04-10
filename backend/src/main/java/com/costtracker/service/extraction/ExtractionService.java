package com.costtracker.service.extraction;

import com.costtracker.dto.ExtractionResultDTO;

import java.nio.file.Path;

/**
 * Extracts structured expense data from a receipt image.
 * Implementations:
 *   - MockExtractionService: returns realistic fake data (dev/testing)
 *   - OpenAiExtractionService: calls GPT-4o vision API (production)
 */
public interface ExtractionService {

    ExtractionResultDTO extract(Path imagePath, String receiptImageRelativePath);
}
