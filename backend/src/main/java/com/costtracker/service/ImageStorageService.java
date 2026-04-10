package com.costtracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    private final Path uploadDir;

    public ImageStorageService(@Value("${app.upload-dir:./uploads/receipts}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir);
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    /**
     * Saves the uploaded file to disk and returns the relative path (e.g. "receipts/abc123.jpg").
     */
    public String store(MultipartFile file) throws IOException {
        validate(file);

        String extension = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + extension;
        Path target = uploadDir.resolve(filename);

        Files.copy(file.getInputStream(), target);

        // Return path relative to uploads/ root, for serving via static resource or controller
        return "receipts/" + filename;
    }

    /**
     * Returns the absolute path to a stored file given its relative path.
     */
    public Path resolve(String relativePath) {
        // relativePath is "receipts/abc123.jpg", uploadDir already points to receipts/
        String filename = relativePath.replace("receipts/", "");
        return uploadDir.resolve(filename);
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File too large. Maximum size is 10 MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Allowed: JPEG, PNG, WebP.");
        }
    }

    private String getExtension(String filename) {
        if (filename != null && filename.contains(".")) {
            return filename.substring(filename.lastIndexOf("."));
        }
        return ".jpg"; // fallback
    }
}
