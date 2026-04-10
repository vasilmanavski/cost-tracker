-- V4: Add google_linked flag to support account linking (local + Google)
ALTER TABLE app_user ADD COLUMN google_linked BOOLEAN NOT NULL DEFAULT FALSE;
