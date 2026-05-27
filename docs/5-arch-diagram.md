# 기술 아키텍처 다이어그램

| 항목 | 내용 |
|------|------|
| 버전 | 1.1 |
| 작성일 | 2026-05-27 |
| 참조 문서 | docs/2-PRD.md v2.0, docs/4-project-structure.md v1.0 |

| 버전 | 일자 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-05-27 | 최초 작성 |
| 1.1 | 2026-05-27 | PostgreSQL 버전(17) 명시, i18n(v2.0) 반영 |

---

## 다이어그램 1: 시스템 전체 구조

```mermaid
flowchart LR
    Browser["브라우저"]
    FE["프론트엔드\nReact 19 + Vite\n:5173"]
    BE["백엔드\nNode.js + Express\n:3000"]
    DB["PostgreSQL 17\n:5432"]

    Browser <--> FE
    FE <-->|"HTTP REST\n/api"| BE
    BE <-->|"pg 라이브러리"| DB
```

---

## 다이어그램 2: 백엔드 레이어 구조

```mermaid
flowchart TD
    Client["클라이언트 요청"]
    Auth["authMiddleware\nJWT 검증 / req.user 주입"]
    Router["Router\n라우트 정의"]
    Controller["Controller\n요청/응답 처리"]
    Service["Service\n비즈니스 로직"]
    Repository["Repository\nSQL 쿼리 (pg 라이브러리)"]
    DB["PostgreSQL 17"]

    Client --> Router
    Router --> Auth
    Auth --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DB
```

---

## 다이어그램 3: v2.0 프론트엔드 확장 구조 `v2.0`

```mermaid
flowchart LR
    subgraph FE["프론트엔드 (v2.0)"]
        UI["UI 컴포넌트"]
        Store["Zustand Store\n(auth + theme + language)"]
        i18n["i18n 라이브러리\n(ko / en)"]
        LS["localStorage\n(theme, language 임시 저장)"]
    end

    UI -->|"테마·언어 토글"| Store
    Store -->|"언어 변경"| i18n
    Store -->|"미로그인 시 임시 저장"| LS
    Store -->|"로그인 후 DB 저장"| BE["백엔드 API\n/api/users"]
```

---

## 다이어그램 4: 인증 흐름

```mermaid
sequenceDiagram
    participant C as 클라이언트
    participant M as authMiddleware
    participant S as authService
    participant D as DB

    Note over C,D: 로그인 흐름
    C->>S: POST /api/auth/login (email, password)
    S->>D: 사용자 조회 (email)
    D-->>S: 사용자 정보 반환
    S->>S: bcrypt 비밀번호 검증
    S-->>C: JWT Access Token 발급
    C->>C: localStorage에 토큰 저장

    Note over C,D: 인증된 API 요청 흐름
    C->>M: API 요청 (Authorization: Bearer 토큰)
    M->>M: JWT 서명 검증
    alt 토큰 유효
        M->>M: req.user 주입
        M-->>C: 요청 처리 후 응답 반환
    else 토큰 만료 또는 유효하지 않음
        M-->>C: 401 Unauthorized
        C->>C: 로그인 페이지로 이동
    end
```
