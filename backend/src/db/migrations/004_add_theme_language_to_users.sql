-- Migration 004: users 테이블에 theme·language 컬럼 추가 (v2.0)
-- 참조: docs/7-execution-plan.md DB-04
-- 001_create_users.sql 에 이미 포함된 경우 IF NOT EXISTS 로 안전하게 처리

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS theme VARCHAR(10) NOT NULL DEFAULT 'light'
    CHECK (theme IN ('light', 'dark'));

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'ko'
    CHECK (language IN ('ko', 'en'));
