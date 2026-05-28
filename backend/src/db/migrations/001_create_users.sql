-- Migration 001: users 테이블 생성
-- 참조: docs/6-erd.md, docs/1-domain-definition.md v1.2

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL          PRIMARY KEY,
    email       VARCHAR(254)    NOT NULL UNIQUE,
    password    VARCHAR         NOT NULL,
    name        VARCHAR(50)     NOT NULL,
    theme       VARCHAR(10)     NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language    VARCHAR(10)     NOT NULL DEFAULT 'ko'    CHECK (language IN ('ko', 'en')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);
