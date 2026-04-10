package com.costtracker.controller;

import com.costtracker.dto.ExtractionResultDTO;
import com.costtracker.service.ImageStorageService;
import com.costtracker.service.extraction.ExtractionService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ImageStorageService imageStorageService;
    private final ExtractionService extractionService;

    public ReceiptController(ImageStorageService imageStorageService, ExtractionService extractionService) {
        this.imageStorageService = imageStorageService;
        this.extractionService = extractionService;
    }

    /**
     * Upload a receipt image, run extraction, and return structured result for review.
     * The image is saved to disk immediately. The extraction result is NOT saved as an expense —
     * the user must review/edit and then POST to /api/expenses to persist.
     */
    @PostMapping("/extract")
    public ExtractionResultDTO extractReceipt(@RequestParam("receipt") MultipartFile file) throws IOException {
        String relativePath = imageStorageService.store(file);
        Path absolutePath = imageStorageService.resolve(relativePath);
        return extractionService.extract(absolutePath, relativePath);
    }

    /**
     * Serve a stored receipt image by filename.
     */
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) throws MalformedURLException {
        Path filePath = imageStorageService.resolve("receipts/" + filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_JPEG_VALUE)
                .body(resource);
    }
}
