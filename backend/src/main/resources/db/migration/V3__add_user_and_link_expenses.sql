-- V3: Add user model, email verification tokens, and link expenses to users

-- User table (named app_user to avoid PostgreSQL reserved word conflict)
CREATE TABLE app_user (
    id                  BIGSERIAL       PRIMARY KEY,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password_hash       VARCHAR(255),
    display_name        VARCHAR(100),
    auth_provider       VARCHAR(20)     NOT NULL DEFAULT 'LOCAL',
    email_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    enabled             BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_user_email ON app_user(email);

-- Email verification token table
CREATE TABLE email_verification_token (
    id                  BIGSERIAL       PRIMARY KEY,
    user_id             BIGINT          NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    token               VARCHAR(255)    NOT NULL UNIQUE,
    expires_at          TIMESTAMP       NOT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used                BOOLEAN         NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_verification_token ON email_verification_token(token);

-- Seed a demo user for local development (existing expenses will belong to this user)
INSERT INTO app_user (id, email, display_name, auth_provider, email_verified, enabled)
VALUES (1, 'demo@costtracker.local', 'Demo User', 'LOCAL', true, true);

-- Add user_id column to expense table (nullable first for the ALTER, then backfill, then make NOT NULL)
ALTER TABLE expense ADD COLUMN user_id BIGINT;

-- Assign all existing demo expenses to the demo user
UPDATE expense SET user_id = 1;

-- Now enforce NOT NULL and add the foreign key
ALTER TABLE expense ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE expense ADD CONSTRAINT fk_expense_user FOREIGN KEY (user_id) REFERENCES app_user(id);

CREATE INDEX idx_expense_user_id ON expense(user_id);

-- Reset the app_user id sequence so the next inserted user gets id=2+
SELECT setval('app_user_id_seq', (SELECT MAX(id) FROM app_user));
