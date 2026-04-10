-- V1: Create category and expense tables (PostgreSQL)

CREATE TABLE category (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL UNIQUE,
    display_name VARCHAR(50)    NOT NULL
);

-- Seed default categories
INSERT INTO category (name, display_name) VALUES
    ('groceries',      'Groceries'),
    ('restaurants',    'Restaurants'),
    ('coffee',         'Coffee'),
    ('transport',      'Transport'),
    ('bills',          'Bills'),
    ('shopping',       'Shopping'),
    ('health',         'Health'),
    ('entertainment',  'Entertainment'),
    ('travel',         'Travel'),
    ('subscriptions',  'Subscriptions'),
    ('other',          'Other');

CREATE TABLE expense (
    id                      BIGSERIAL       PRIMARY KEY,
    merchant                VARCHAR(255)    NOT NULL,
    description             VARCHAR(500)    NOT NULL,
    amount                  NUMERIC(12, 2)  NOT NULL,
    currency                VARCHAR(3)      NOT NULL DEFAULT 'USD',
    category                VARCHAR(50)     NOT NULL,
    expense_date            DATE            NOT NULL,
    source_type             VARCHAR(20)     NOT NULL,
    receipt_image_path      VARCHAR(500),
    line_items_json         TEXT,
    extraction_confidence   VARCHAR(10),
    needs_review            BOOLEAN         NOT NULL DEFAULT FALSE,
    notes                   TEXT,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_category FOREIGN KEY (category) REFERENCES category(name)
);
