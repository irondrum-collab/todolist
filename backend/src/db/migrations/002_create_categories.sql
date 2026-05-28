-- Migration 002: categories 테이블 생성
-- 참조: docs/6-erd.md, docs/1-domain-definition.md v1.2
-- DR-CAT-01: 할 일 등록 시 카테고리 미지정이면 '기본' 카테고리 자동 적용 (앱 레이어 처리)
-- DR-CAT-02: '기본' 카테고리는 삭제 불가 (앱 레이어 처리)

CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(30)     NOT NULL,
    user_id     INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
