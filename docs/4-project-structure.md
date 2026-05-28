# 프로젝트 구조 설계 원칙 — TodoList 앱

| 항목 | 내용 |
|------|------|
| 버전 | 1.0 |
| 작성일 | 2026-05-27 |
| 참조 문서 | docs/1-domain-definition.md v1.2, docs/2-PRD.md v2.0 |

---

## 1. 공통 최상위 원칙

### 레이어 분리
- 프론트엔드와 백엔드는 독립적인 레이어로 분리한다.
- 각 레이어는 자신의 역할 범위 안에서만 동작하며, 다른 레이어를 직접 조작하지 않는다.

### 단방향 의존성
- 의존 방향은 항상 상위 레이어 → 하위 레이어로만 흐른다.
- 하위 레이어는 상위 레이어를 참조하지 않는다.

### 단일 책임
- 하나의 파일 / 모듈 / 함수는 하나의 책임만 가진다.
- 비즈니스 로직은 서비스 레이어에만 작성한다. 라우터와 컨트롤러에 비즈니스 로직을 작성하지 않는다.

### 오버엔지니어링 금지
- 현재 요구사항에 없는 추상화, 패턴, 기능을 미리 구현하지 않는다.
- 복잡한 구조보다 단순하고 읽기 쉬운 코드를 우선한다.

---

## 2. 의존성 / 레이어 원칙

### 프론트엔드 레이어 구조

```
UI 컴포넌트 (pages, components)
    ↓
전역 상태 (store — Zustand)
    ↓
서버 상태 / API 호출 (hooks — TanStack Query + api)
    ↓
백엔드 서버
```

| 레이어 | 역할 | 허용 | 금지 |
|--------|------|------|------|
| UI 컴포넌트 | 화면 렌더링, 사용자 인터랙션 | store 읽기, hooks 호출 | API 직접 호출, 비즈니스 로직 |
| store (Zustand) | 클라이언트 전역 상태 관리 | 상태 저장·변경 | API 직접 호출 |
| hooks (TanStack Query) | 서버 데이터 fetch, 캐싱, 동기화 | api 모듈 호출 | store 직접 변경 |
| api | HTTP 요청 함수 모음 | axios/fetch 사용 | 상태 관리 로직 |

### 백엔드 레이어 구조

```
Router (라우팅 + 미들웨어 연결)
    ↓
Controller (요청/응답 처리)
    ↓
Service (비즈니스 로직)
    ↓
Repository (DB 쿼리)
    ↓
PostgreSQL (데이터베이스)
```

| 레이어 | 역할 | 허용 | 금지 |
|--------|------|------|------|
| Router | URL과 핸들러 연결, 미들웨어 적용 | Controller 호출 | 비즈니스 로직, DB 접근 |
| Controller | req/res 파싱, 응답 직렬화, 유효성 검사 | Service 호출 | DB 직접 접근, 비즈니스 로직 |
| Service | 도메인 규칙 구현, 트랜잭션 제어 | Repository 호출 | req/res 객체 접근 |
| Repository | SQL 쿼리 실행, 결과 반환 | pg 쿼리 (파라미터 바인딩) | 비즈니스 로직, HTTP 관련 코드 |

---

## 3. 코드 / 네이밍 원칙

### 공통 원칙
- 파일명, 변수명은 의미를 명확히 표현한다. 축약어는 널리 알려진 경우(id, url, jwt)만 허용한다.
- DB 컬럼명은 `snake_case`를 사용한다. (예: `user_id`, `created_at`, `is_completed`)
- API 응답 JSON 필드명은 `camelCase`를 사용한다. (예: `userId`, `createdAt`, `isCompleted`)

### 프론트엔드 (TypeScript)

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일명 — 컴포넌트 | PascalCase | `TodoItem.tsx`, `LoginForm.tsx` |
| 파일명 — 일반 모듈 | camelCase | `todoApi.ts`, `useAuth.ts` |
| 컴포넌트명 | PascalCase | `TodoList`, `CategoryFilter` |
| 함수명 | camelCase | `fetchTodos`, `handleSubmit` |
| 커스텀 훅 | `use` 접두사 + camelCase | `useTodos`, `useAuthStore` |
| 변수명 | camelCase | `isCompleted`, `categoryId` |
| 타입 / 인터페이스 | PascalCase | `Todo`, `User`, `ApiResponse` |
| 상수 | UPPER_SNAKE_CASE | `MAX_TITLE_LENGTH`, `API_BASE_URL` |
| CSS 클래스 | kebab-case (Tailwind 사용 시 유틸리티 클래스 우선) | `todo-item`, `filter-button` |

### 백엔드 (JavaScript)

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일명 | camelCase | `todoService.js`, `authMiddleware.js` |
| 함수명 | camelCase | `createTodo`, `verifyToken` |
| 변수명 | camelCase | `userId`, `hashedPassword` |
| 상수 | UPPER_SNAKE_CASE | `JWT_SECRET`, `SALT_ROUNDS` |
| 라우터 파일 | 도메인명 + `Routes` | `todoRoutes.js`, `authRoutes.js` |
| 컨트롤러 파일 | 도메인명 + `Controller` | `todoController.js` |
| 서비스 파일 | 도메인명 + `Service` | `todoService.js` |
| 리포지토리 파일 | 도메인명 + `Repository` | `todoRepository.js` |

---

## 4. 테스트 / 품질 원칙

### 테스트 전략

| 구분 | 대상 | 도구 |
|------|------|------|
| 단위 테스트 | Service 레이어 비즈니스 로직, 유틸 함수 | Jest |
| 통합 테스트 | API 엔드포인트 (Router → Controller → Service → DB) | Jest + Supertest |

- Repository 레이어는 통합 테스트에서 실제 DB(테스트용)를 사용하여 검증한다.
- 핵심 도메인 규칙(상태 계산, 날짜 유효성, 소유권 검사)은 단위 테스트로 반드시 커버한다.

### 코드 품질 도구

| 도구 | 적용 범위 | 설정 파일 |
|------|----------|----------|
| ESLint | 프론트엔드(TS), 백엔드(JS) 각각 | `.eslintrc.js` |
| Prettier | 전체 | `.prettierrc` |

- 들여쓰기: 스페이스 2칸
- 세미콜론: 사용
- 문자열 따옴표: 작은따옴표(`'`)
- 프론트엔드: `@typescript-eslint` 룰셋 적용

---

## 5. 설정 / 보안 / 운영 원칙

### 환경변수 관리
- 모든 민감 설정(DB 접속 정보, JWT 시크릿, 포트 등)은 환경변수로 관리한다.
- `.env` 파일은 `.gitignore`에 포함하며, `.env.example`만 저장소에 커밋한다.
- 백엔드 시작 시 필수 환경변수 누락 여부를 검사하고, 없으면 프로세스를 종료한다.

**필수 환경변수 (백엔드)**
```
PORT=3000
DATABASE_URL          # postgres://user:password@host:5432/dbname
JWT_SECRET
JWT_EXPIRES_IN        # 예: 7d
BCRYPT_SALT_ROUNDS    # 예: 12
CORS_ORIGIN           # 예: http://localhost:5173
```

**필수 환경변수 (프론트엔드)**
```
VITE_API_BASE_URL     # 예: http://localhost:3000/api
```
- Vite 환경변수는 반드시 `VITE_` 접두사를 붙여야 클라이언트 코드에서 `import.meta.env`로 접근 가능하다.
- `.env` 파일은 `.gitignore`에 포함하며, `.env.example`만 저장소에 커밋한다.

### JWT 원칙
- Access Token만 사용한다. Refresh Token은 v1.0 범위 외.
- 토큰은 클라이언트의 `localStorage`에 저장하고, 모든 API 요청 헤더에 `Authorization: Bearer <token>`으로 전달한다.
- 토큰 만료 시 백엔드는 401을 반환하고, 프론트엔드는 로그인 페이지로 리다이렉트한다.
- 인증이 필요한 모든 라우트는 `authMiddleware`를 통해 보호한다.

### bcrypt 원칙
- 비밀번호는 반드시 bcrypt로 해싱하여 저장한다. 평문 저장 금지.
- Salt rounds는 환경변수 `BCRYPT_SALT_ROUNDS`로 관리하며, 기본값은 12.

### DB 연동 원칙
- DB 연동은 반드시 **pg 라이브러리만 사용한다. Prisma 사용을 금지한다.**

### SQL Injection 방지
- 모든 DB 쿼리는 pg 라이브러리의 파라미터 바인딩(`$1`, `$2`, ...)을 사용한다.
- 문자열 보간으로 SQL을 조합하는 것을 금지한다.

```js
// 올바른 예
const result = await pool.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [todoId, userId]);

// 금지
const result = await pool.query(`SELECT * FROM todos WHERE id = ${todoId}`);
```

### CORS
- 백엔드는 프론트엔드 개발 서버 Origin만 허용한다. (`cors` 미들웨어 사용)
- 프로덕션 배포 시 실제 도메인으로 Origin을 제한한다.

### 에러 응답 형식
- 모든 에러 응답은 아래 형식을 따른다.

```json
{
  "message": "에러 설명 (사용자에게 노출 가능한 메시지)"
}
```

| HTTP 상태 코드 | 사용 상황 |
|--------------|---------|
| 400 | 요청 유효성 오류 (입력값 형식 오류, 필수 항목 누락 등) |
| 401 | 미인증 (토큰 없음, 만료, 유효하지 않음) |
| 403 | 권한 없음 (타인의 리소스 접근 시도) |
| 404 | 리소스 없음 |
| 409 | 중복 충돌 (이메일 중복 등) |
| 500 | 서버 내부 오류 |

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                        # API 호출 함수 모음
│   │   ├── authApi.ts              # 회원가입, 로그인 API
│   │   ├── todoApi.ts              # 할 일 CRUD API
│   │   └── userApi.ts              # 내 정보 수정 API
│   │
│   ├── components/                 # 재사용 UI 컴포넌트
│   │   ├── common/                 # 버튼, 인풋, 모달 등 범용 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── todo/                   # 할 일 관련 컴포넌트
│   │   │   ├── TodoItem.tsx        # 할 일 단건 카드
│   │   │   ├── TodoList.tsx        # 할 일 목록
│   │   │   ├── TodoForm.tsx        # 할 일 등록/수정 폼
│   │   │   └── TodoFilter.tsx      # 카테고리·상태 필터
│   │   └── layout/
│   │       └── Header.tsx          # 공통 헤더
│   │
│   ├── hooks/                      # TanStack Query 커스텀 훅
│   │   ├── useTodos.ts             # 할 일 목록 조회
│   │   ├── useTodoMutations.ts     # 할 일 생성/수정/삭제
│   │   └── useAuth.ts              # 로그인/회원가입
│   │
│   ├── pages/                      # 라우트 단위 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── TodoListPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── store/                      # Zustand 전역 상태
│   │   └── authStore.ts            # 인증 토큰, 사용자 정보 상태
│   │
│   ├── types/                      # TypeScript 타입 정의
│   │   ├── todo.ts                 # Todo, Category 타입
│   │   └── user.ts                 # User 타입
│   │
│   ├── utils/                      # 순수 유틸 함수
│   │   ├── todoStatus.ts           # 할 일 상태 계산 함수
│   │   └── dateFormatter.ts        # 날짜 포맷 함수
│   │
│   ├── locales/                    # [v2.0] 다국어 리소스
│   │   ├── ko.json
│   │   └── en.json
│   │
│   ├── App.tsx                     # 라우터 설정
│   ├── main.tsx                    # 앱 진입점
│   └── constants.ts                # 전역 상수 (API_BASE_URL 등)
│
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
```

**디렉토리별 역할 요약**

| 디렉토리 | 역할 |
|---------|------|
| `api/` | axios 또는 fetch 기반 HTTP 요청 함수. 각 도메인별로 파일 분리 |
| `components/` | 재사용 가능한 UI 단위. 도메인별 하위 폴더로 분류 |
| `hooks/` | TanStack Query를 활용한 서버 데이터 fetch / mutation 훅 |
| `pages/` | 라우트에 직접 연결되는 최상위 컴포넌트 |
| `store/` | Zustand 기반 클라이언트 전역 상태 (인증 정보 등) |
| `types/` | 공통 TypeScript 타입 / 인터페이스 정의 |
| `utils/` | 부수 효과 없는 순수 함수 (상태 계산, 포맷 등) |
| `locales/` | **[v2.0]** 다국어 JSON 리소스 (i18n 라이브러리 연동) |

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── routes/                     # 라우터: URL 정의 + 미들웨어 연결
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── categoryRoutes.js       # /api/categories
│   │   ├── todoRoutes.js           # /api/todos
│   │   └── userRoutes.js           # /api/users
│   │
│   ├── controllers/                # 요청/응답 처리, 유효성 검사
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── todoController.js
│   │   └── userController.js
│   │
│   ├── services/                   # 비즈니스 로직, 도메인 규칙
│   │   ├── authService.js          # 회원가입, 로그인, 토큰 발급
│   │   ├── categoryService.js      # 카테고리 CRUD, 기본 카테고리 보호
│   │   ├── todoService.js          # 할 일 CRUD, 소유권 검사
│   │   └── userService.js          # 내 정보 수정, 비밀번호 변경
│   │
│   ├── repositories/               # SQL 쿼리 실행 (pg 파라미터 바인딩)
│   │   ├── categoryRepository.js
│   │   ├── todoRepository.js
│   │   └── userRepository.js
│   │
│   ├── middlewares/                # Express 미들웨어
│   │   ├── authMiddleware.js       # JWT 검증, req.user 주입
│   │   └── errorMiddleware.js      # 전역 에러 핸들러
│   │
│   ├── db/
│   │   ├── pool.js                 # pg Pool 인스턴스 생성 및 export (PostgreSQL 17)
│   │   └── migrations/             # SQL 마이그레이션 파일
│   │       ├── 001_create_users.sql
│   │       ├── 002_create_categories.sql
│   │       └── 003_create_todos.sql
│   │
│   ├── utils/
│   │   ├── logger.js               # 콘솔 로깅 유틸 (info / warn / error)
│   │   ├── todoStatus.js           # 할 일 상태 런타임 계산 함수
│   │   └── validate.js             # 공통 유효성 검사 함수
│   │
│   └── app.js                      # Express 앱 설정 (미들웨어, 라우터 등록)
│
├── server.js                       # 서버 진입점 (포트 바인딩)
├── swagger.json                    # OpenAPI 3.0 명세 (Swagger UI: /api-docs)
├── .env
├── .env.example
├── .eslintrc.js
├── .prettierrc
└── package.json
```

**디렉토리별 역할 요약**

| 디렉토리/파일 | 역할 |
|-------------|------|
| `routes/` | 엔드포인트 URL 정의, 미들웨어와 컨트롤러 연결 |
| `controllers/` | req 파싱, 입력 유효성 검사, Service 호출, res 반환 |
| `services/` | 도메인 규칙 구현 (소유권 검사, 날짜 유효성 등), Repository 조합 |
| `repositories/` | pg 파라미터 바인딩 기반 SQL 쿼리 실행 및 결과 반환 |
| `middlewares/` | JWT 인증 미들웨어, 전역 에러 핸들러 |
| `db/pool.js` | pg Pool 단일 인스턴스 생성. 모든 Repository는 이를 import하여 사용 |
| `db/migrations/` | 순서 있는 SQL DDL 파일. 직접 실행하여 스키마 적용 |
| `utils/` | 레이어에 종속되지 않는 순수 유틸 함수 (로깅, 상태 계산, 유효성 검사) |
| `app.js` | Express 앱 초기화, CORS·바디파서·라우터 등록, Swagger UI 마운트 |
| `server.js` | `app.js`를 import하여 포트 리슨. 진입점만 담당 |
| `swagger.json` | OpenAPI 3.0 명세. `/api-docs` 경로에서 Swagger UI로 확인 가능 |
