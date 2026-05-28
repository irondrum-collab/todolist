-- Migration 003: todos 테이블 생성, 트리거, 인덱스
-- 참조: docs/6-erd.md, docs/1-domain-definition.md v1.2
-- DR-TODO-03: 종료일자는 시작일자와 같거나 이후여야 한다

CREATE TABLE IF NOT EXISTS todos (
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

    CONSTRAINT chk_date_order CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- updated_at 자동 갱신 트리거
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

CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_category_id ON todos(category_id);
