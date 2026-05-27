-- TodoList 앱 데이터베이스 스키마
-- PostgreSQL 17
-- 참조: docs/6-erd.md v1.0, docs/1-domain-definition.md v1.2

-- ============================================================
-- 테이블 삭제 (재실행 시 초기화)
-- ============================================================
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE users (
    id          SERIAL          PRIMARY KEY,
    email       VARCHAR(254)    NOT NULL UNIQUE,
    password    VARCHAR         NOT NULL,
    name        VARCHAR(50)     NOT NULL,
    theme       VARCHAR(10)     NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language    VARCHAR(10)     NOT NULL DEFAULT 'ko'    CHECK (language IN ('ko', 'en')),
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- categories
-- ============================================================
CREATE TABLE categories (
    id          SERIAL          PRIMARY KEY,
    name        VARCHAR(30)     NOT NULL,
    user_id     INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 기본 카테고리 시드 (각 사용자 가입 시 애플리케이션 레이어에서 삽입)
-- DR-CAT-01: 할 일 등록 시 카테고리 미지정이면 해당 사용자의 '기본' 카테고리 자동 적용
-- DR-CAT-02: '기본' 카테고리는 삭제 불가 (애플리케이션 레이어에서 강제)

-- ============================================================
-- todos
-- ============================================================
CREATE TABLE todos (
    id              SERIAL          PRIMARY KEY,
    title           VARCHAR(100)    NOT NULL,
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
    category_id     INTEGER         NOT NULL REFERENCES categories(id),
    user_id         INTEGER         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- DR-TODO-03: 종료일자는 시작일자와 같거나 이후여야 한다
    CONSTRAINT chk_date_order CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 인덱스
-- ============================================================
-- 사용자별 할 일 목록 조회 (UC-05)
CREATE INDEX idx_todos_user_id ON todos(user_id);

-- 카테고리 필터링 (UC-05)
CREATE INDEX idx_todos_category_id ON todos(category_id);

-- 사용자별 카테고리 조회
CREATE INDEX idx_categories_user_id ON categories(user_id);
