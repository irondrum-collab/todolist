# 실행 계획 (Execution Plan)

| 항목 | 내용 |
|------|------|
| 버전 | 1.0 |
| 작성일 | 2026-05-28 |
| 참조 문서 | docs/1-domain-definition.md v1.2, docs/2-PRD.md v2.0, docs/4-project-structure.md v1.0, docs/6-erd.md v1.0 |

| 버전 | 일자 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2026-05-28 | 최초 작성 |

---

## 개요

- **개발 순서**: 데이터베이스 → 백엔드 → 프론트엔드
- **단계 구분**: v1.0 (핵심 기능) 완료 후 v2.0 (테마·다국어) 착수
- **Task 표기**: `[DB]` `[BE]` `[FE]` 접두사로 레이어 구분
- **의존성 표기**: 각 Task 하단 "의존성" 항목에 선행 Task ID 명시

---

## Phase 1 — v1.0 핵심 기능

---

### [DB] 데이터베이스

---

#### DB-01. 로컬 DB 환경 구성

**목표**: PostgreSQL 17 서버 준비 및 애플리케이션 전용 DB 생성

**작업 항목**
- [x] PostgreSQL 17 로컬 설치 확인 (또는 Docker 컨테이너 실행)
- [x] `todolist` 데이터베이스 생성
- [x] 접속 전용 사용자(role) 생성 및 권한 부여
- [x] `DATABASE_URL` 접속 문자열 확인 (`postgres://user:password@localhost:5432/todolist`)

**완료 조건**
- [x] `psql` 또는 DB 클라이언트로 `todolist` DB 접속 성공
- [x] 접속 전용 사용자로 로그인 가능

**의존성**: 없음

---

#### DB-02. v1.0 마이그레이션 파일 작성

**목표**: `database/schema.sql` 기반으로 순서 있는 마이그레이션 파일 3개 작성

**작업 항목**
- [x] `backend/src/db/migrations/001_create_users.sql` 작성
  - `users` 테이블 DDL (id, email, password, name, theme DEFAULT 'light', language DEFAULT 'ko', created_at)
  - `email` UNIQUE 제약, `theme`/`language` CHECK 제약
- [x] `backend/src/db/migrations/002_create_categories.sql` 작성
  - `categories` 테이블 DDL (id, name, user_id FK)
  - `user_id` ON DELETE CASCADE
- [x] `backend/src/db/migrations/003_create_todos.sql` 작성
  - `todos` 테이블 DDL (id, title, description, start_date, end_date, is_completed, category_id FK, user_id FK, created_at, updated_at)
  - `end_date >= start_date` CHECK 제약 (DR-TODO-03)
  - `updated_at` 자동 갱신 트리거 함수 + 트리거
  - 인덱스: `idx_todos_user_id`, `idx_todos_category_id`, `idx_categories_user_id`

**완료 조건**
- [x] 마이그레이션 파일 3개 순서대로 실행 시 오류 없이 적용됨
- [x] 재실행(DROP → CREATE) 시에도 정상 동작

**의존성**: DB-01

---

#### DB-03. 스키마 적용 및 검증

**목표**: 실제 DB에 스키마를 적용하고 구조 이상 여부 확인

**작업 항목**
- [x] 마이그레이션 파일 3개 순서대로 실행
- [x] `\d users`, `\d categories`, `\d todos` 로 컬럼·제약·인덱스 확인
- [x] 트리거 동작 확인 (todos 레코드 UPDATE 시 `updated_at` 자동 갱신)
- [x] FK 제약 동작 확인 (없는 user_id 참조 시 오류 발생)

**완료 조건**
- [x] 3개 테이블 정상 생성 확인
- [x] `end_date < start_date` 입력 시 CHECK 제약 오류 발생 확인
- [x] `updated_at` 트리거 정상 동작 확인

**의존성**: DB-02

---

### [BE] 백엔드 (v1.0)

---

#### BE-01. 프로젝트 초기화

**목표**: 백엔드 Node.js 프로젝트 뼈대 구성

**작업 항목**
- [x] `backend/` 디렉토리 생성 및 `npm init` 실행
- [x] 의존성 설치: `express`, `pg`, `bcrypt`, `jsonwebtoken`, `cors`, `dotenv`
- [x] 개발 의존성 설치: `eslint`, `prettier`, `jest`, `supertest`, `nodemon`
- [x] 디렉토리 구조 생성: `src/routes/`, `src/controllers/`, `src/services/`, `src/repositories/`, `src/middlewares/`, `src/db/migrations/`, `src/utils/`
- [x] `.env.example` 작성 (PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS, CORS_ORIGIN)
- [x] `.env` 작성 (로컬 값 설정, gitignore 확인)
- [x] `.eslintrc.js`, `.prettierrc` 설정 (스페이스 2칸, 세미콜론, 작은따옴표)
- [x] `package.json` scripts 설정: `start`, `dev` (nodemon), `test`

**완료 조건**
- [x] `npm run dev` 실행 시 오류 없이 서버 프로세스 시작
- [x] `.env`가 `.gitignore`에 포함되어 있음

**의존성**: 없음

---

#### BE-02. DB 연결 풀 설정

**목표**: pg Pool 단일 인스턴스 생성 및 전체 Repository에서 공유 사용

**작업 항목**
- [x] `src/db/pool.js` 작성: `DATABASE_URL` 환경변수로 pg Pool 생성 및 export
- [x] 서버 시작 시 필수 환경변수 누락 검사 로직 추가 (없으면 `process.exit(1)`)
- [x] DB 연결 테스트 쿼리 (`SELECT NOW()`) 실행 후 성공 로그 출력

**완료 조건**
- [x] `npm run dev` 시 DB 연결 성공 로그 출력
- [x] `DATABASE_URL` 누락 시 프로세스 종료 확인

**의존성**: BE-01, DB-03

---

#### BE-03. 공통 미들웨어 구성

**목표**: Express 앱에 CORS, 바디파서, 인증, 에러 미들웨어 등록

**작업 항목**
- [x] `src/app.js` 작성: `express()` 초기화, `cors` (CORS_ORIGIN 환경변수), `express.json()` 등록
- [x] `src/server.js` 작성: `app.js` import, PORT 바인딩
- [x] `src/middlewares/authMiddleware.js` 작성
  - `Authorization: Bearer <token>` 헤더 파싱
  - `jsonwebtoken.verify()` 로 JWT 검증
  - 유효 시 `req.user = { id, email }` 주입
  - 무효·만료 시 `401` 반환
- [x] `src/middlewares/errorMiddleware.js` 작성
  - 전역 에러 핸들러 (`app.use((err, req, res, next) => ...)`)
  - `{ message }` 형식으로 에러 응답 반환
  - 상태 코드 매핑 (400, 401, 403, 404, 409, 500)

**완료 조건**
- [x] 유효하지 않은 JWT로 요청 시 `401 { "message": "..." }` 반환 확인
- [x] 서버 내부 오류 발생 시 `500 { "message": "..." }` 반환 확인

**의존성**: BE-01

---

#### BE-04. 공통 유틸 함수

**목표**: 레이어 독립적인 유효성 검사 함수 작성

**작업 항목**
- [x] `src/utils/validate.js` 작성
  - 이메일 형식 검사 (RFC 5322)
  - 비밀번호 강도 검사 (8~128자, 영문·숫자·특수문자 각 1자 이상)
  - 필수 항목 누락 검사 유틸

**완료 조건**
- [x] 정상 이메일·비밀번호 → 검사 통과
- [x] 형식 오류 → 명확한 오류 메시지 반환

**의존성**: BE-01

---

#### BE-05. 회원가입 API (UC-01)

**목표**: `POST /api/auth/register` 구현

**작업 항목**
- [x] `src/repositories/userRepository.js` 작성
  - `findByEmail(email)`: 이메일로 사용자 조회
  - `createUser({ email, password, name })`: 사용자 생성
- [x] `src/repositories/categoryRepository.js` 작성
  - `createDefaultCategory(userId)`: '기본' 카테고리 생성 (DR-CAT-01)
- [x] `src/services/authService.js` — `register()` 작성
  - 이메일 중복 검사 → 중복 시 409
  - bcrypt로 비밀번호 해싱 (BCRYPT_SALT_ROUNDS)
  - `userRepository.createUser()` 호출
  - `categoryRepository.createDefaultCategory()` 호출 (회원가입 직후 기본 카테고리 생성)
- [x] `src/controllers/authController.js` — `register()` 작성
  - 요청 body 파싱 (email, password, name)
  - `validate.js` 유효성 검사
  - `authService.register()` 호출
  - `201` 응답
- [x] `src/routes/authRoutes.js` 작성: `POST /api/auth/register` 라우팅

**완료 조건**
- [x] 정상 요청 → `201` 응답, DB에 사용자 레코드 생성 확인
- [x] 이메일 중복 → `409 { "message": "이미 사용 중인 이메일입니다" }` 응답
- [x] 이메일 형식 오류 → `400` 응답
- [x] 비밀번호 강도 미달 → `400` 응답
- [x] 비밀번호가 bcrypt 해싱된 형태로 DB 저장 확인

**의존성**: BE-02, BE-03, BE-04

---

#### BE-06. 로그인 API (UC-02)

**목표**: `POST /api/auth/login` 구현

**작업 항목**
- [x] `src/services/authService.js` — `login()` 작성
  - `userRepository.findByEmail()` 로 사용자 조회
  - 사용자 없음 또는 bcrypt 비밀번호 불일치 → 401 (동일 메시지로 보안 유지)
  - JWT Access Token 발급 (payload: `{ id, email }`, `JWT_EXPIRES_IN`)
- [x] `src/controllers/authController.js` — `login()` 작성
  - body 파싱 (email, password)
  - `authService.login()` 호출
  - `200 { token, user: { id, email, name } }` 응답
- [x] `src/routes/authRoutes.js`: `POST /api/auth/login` 라우팅 추가

**완료 조건**
- [x] 정상 요청 → `200 { token, user }` 응답
- [x] 이메일 미존재 → `401 { "message": "이메일 또는 비밀번호가 올바르지 않습니다" }` 응답
- [x] 비밀번호 불일치 → 동일한 `401` 메시지 응답
- [x] 발급된 토큰으로 인증 필요 API 호출 시 정상 처리

**의존성**: BE-05

---

#### BE-07. 내 정보 수정 API (UC-03 v1.0)

**목표**: `PUT /api/users/me` 구현 (이름·비밀번호 수정)

**작업 항목**
- [x] `src/repositories/userRepository.js` 추가
  - `findById(id)`: ID로 사용자 조회
  - `updateUser(id, { name, password })`: 사용자 정보 수정
- [x] `src/services/userService.js` 작성
  - 현재 비밀번호 검증 (변경 시 필수)
  - bcrypt로 신규 비밀번호 해싱
  - `userRepository.updateUser()` 호출
- [x] `src/controllers/userController.js` 작성
  - body 파싱 (name, currentPassword, newPassword)
  - `authMiddleware` 통해 주입된 `req.user.id` 사용
  - `userService` 호출, `200 { user }` 응답
- [x] `src/routes/userRoutes.js` 작성: `PUT /api/users/me` (authMiddleware 적용)

**완료 조건**
- [x] 정상 요청 → `200`, 이름·비밀번호 수정 확인
- [x] 현재 비밀번호 불일치 → `401 { "message": "현재 비밀번호가 올바르지 않습니다" }` 응답
- [x] 미인증 요청 → `401` 응답

**의존성**: BE-06

---

#### BE-08. 할 일 CRUD API (UC-04 ~ UC-07)

**목표**: `POST/GET/PUT/DELETE /api/todos` 구현

**작업 항목**
- [x] `src/repositories/todoRepository.js` 작성
  - `create({ title, description, startDate, endDate, categoryId, userId })`: 할 일 생성
  - `findAllByUser(userId, { categoryId, status })`: 사용자 할 일 목록 조회 (필터 지원)
  - `findById(id)`: 단건 조회
  - `update(id, fields)`: 할 일 수정
  - `remove(id)`: 할 일 삭제
- [x] `src/services/todoService.js` 작성
  - `create()`: categoryId 미지정 시 기본 카테고리 ID 자동 적용 (DR-CAT-01)
  - `getList()`: 목록 반환 (status 필터는 서버에서 날짜 계산)
  - `update()`: 소유권 검사 (req.user.id !== todo.userId → 403, DR-TODO-04), 날짜 유효성 (DR-TODO-03)
  - `remove()`: 소유권 검사 (DR-TODO-04)
- [x] `src/controllers/todoController.js` 작성
  - DB snake_case → 응답 camelCase 변환
  - 각 액션별 유효성 검사 (제목 1~100자, 날짜 형식 YYYY-MM-DD)
- [x] `src/routes/todoRoutes.js` 작성 (모든 라우트에 authMiddleware 적용)
  - `POST /api/todos` (UC-04)
  - `GET /api/todos` (UC-05, query: categoryId, status)
  - `PUT /api/todos/:id` (UC-06)
  - `DELETE /api/todos/:id` (UC-07)

**완료 조건**
- [x] `POST /api/todos` → `201`, DB 레코드 생성 확인
- [x] `GET /api/todos` → 본인 할 일만 반환 확인
- [x] 카테고리·상태 필터 적용 시 정상 필터링 확인
- [x] `PUT /api/todos/:id` 타인 소유 → `403` 응답
- [x] `DELETE /api/todos/:id` 타인 소유 → `403` 응답
- [x] `end_date < start_date` 요청 → `400` 응답
- [x] 미인증 요청 → `401` 응답

**의존성**: BE-06

---

#### BE-08a. 카테고리 CRUD API (UC-10)

**목표**: `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id` 구현

**작업 항목**
- [x] `src/repositories/categoryRepository.js` 확장
  - `findAllByUser(userId)`: 사용자 카테고리 목록 조회
  - `findById(id)`: 단건 조회
  - `create(userId, name)`: 카테고리 생성
  - `update(id, name)`: 카테고리 이름 수정
  - `remove(id)`: 카테고리 삭제
- [x] `src/services/categoryService.js` 작성
  - `getList(userId)`: 카테고리 목록 반환
  - `create(userId, name)`: 카테고리 생성
  - `update(userId, categoryId, name)`: 소유권 검사 (403), '기본' 수정 차단 (DR-CAT-03, 400)
  - `remove(userId, categoryId)`: 소유권 검사 (403), '기본' 삭제 차단 (DR-CAT-02, 400)
- [x] `src/controllers/categoryController.js` 작성
  - 이름 유효성 검사 (1~30자)
  - 각 액션 호출 및 응답 직렬화
- [x] `src/routes/categoryRoutes.js` 작성 (모든 라우트에 authMiddleware 적용)
  - `GET /api/categories` (UC-10)
  - `POST /api/categories` (UC-10)
  - `PUT /api/categories/:id` (UC-10)
  - `DELETE /api/categories/:id` (UC-10)

**완료 조건**
- [x] `GET /api/categories` → 본인 카테고리만 반환 (기본 포함) 확인
- [x] `POST /api/categories` → `201`, DB 레코드 생성 확인
- [x] `PUT /api/categories/:id` 타인 소유 → `403` 응답
- [x] `PUT /api/categories/:id` '기본' 카테고리 → `400` 응답
- [x] `DELETE /api/categories/:id` 타인 소유 → `403` 응답
- [x] `DELETE /api/categories/:id` '기본' 카테고리 → `400` 응답
- [x] 미인증 요청 → `401` 응답

**의존성**: BE-05

---

#### BE-09. 라우터 통합 및 서버 기동 검증

**목표**: 모든 라우터를 `app.js`에 등록하고 전체 API 동작 확인

**작업 항목**
- [x] `src/app.js`에 `authRoutes`, `categoryRoutes`, `todoRoutes`, `userRoutes` 등록
  - `/api/auth`, `/api/categories`, `/api/todos`, `/api/users` 경로 매핑
- [x] `swagger-ui-express` 설치 및 `/api-docs` 경로에 Swagger UI 마운트
- [x] `errorMiddleware` 마지막에 등록
- [x] API 전체 흐름 수동 테스트 (curl 또는 REST Client)
  - 회원가입 → 로그인 → 카테고리 CRUD → 할 일 CRUD → 내 정보 수정 순서로 검증

**완료 조건**
- [x] 모든 엔드포인트 HTTP 상태 코드 정상 반환 확인
- [x] 인증 없이 보호된 라우트 접근 시 `401` 반환 확인
- [x] 에러 발생 시 `{ "message": "..." }` 형식 응답 확인
- [x] `http://localhost:3000/api-docs` 에서 Swagger UI 정상 노출 확인

**의존성**: BE-05, BE-06, BE-07, BE-08, BE-08a

---

### [FE] 프론트엔드 (v1.0)

---

#### FE-01. 프로젝트 초기화

**목표**: Vite + React 19 + TypeScript 프로젝트 뼈대 구성

**작업 항목**
- [x] `npm create vite@latest frontend -- --template react-ts` 실행
- [x] 의존성 설치: `zustand`, `@tanstack/react-query`, `axios`, `react-router-dom`
- [x] 개발 의존성 설치: `eslint`, `prettier`, `@typescript-eslint/*`
- [x] 디렉토리 구조 생성: `src/api/`, `src/components/common/`, `src/components/todo/`, `src/components/layout/`, `src/hooks/`, `src/pages/`, `src/store/`, `src/types/`, `src/utils/`
- [x] `.env.example` 작성 (`VITE_API_BASE_URL`)
- [x] `.env` 작성 (`VITE_API_BASE_URL=http://localhost:3000/api`)
- [x] `src/constants.ts` 작성 (`API_BASE_URL = import.meta.env.VITE_API_BASE_URL`)
- [x] `.prettierrc` 설정 (스페이스 2칸, 세미콜론, 작은따옴표, typescript-eslint), `eslint.config.js`에 prettier 통합
- [x] `vite.config.ts`: 개발 서버 포트 5173 고정

**완료 조건**
- [x] `npm run dev` → `http://localhost:5173` 접속 성공
- [x] TypeScript 컴파일 오류 없음

**의존성**: 없음

---

#### FE-02. TypeScript 타입 정의

**목표**: 도메인 엔티티 타입 정의 (백엔드 API 응답 기준 camelCase)

**작업 항목**
- [ ] `src/types/user.ts` 작성
  - `User`: `{ id, email, name, theme, language, createdAt }`
  - `LoginResponse`: `{ token, user: User }`
- [ ] `src/types/todo.ts` 작성
  - `Todo`: `{ id, title, description, startDate, endDate, isCompleted, categoryId, userId, createdAt, updatedAt }`
  - `Category`: `{ id, name, userId }`
  - `TodoStatus`: `'시작 전' | '진행 중' | '완료' | '기한 초과' | '진행 중 (날짜 없음)'`
  - `CreateTodoInput`, `UpdateTodoInput` 타입

**완료 조건**
- [ ] 모든 타입 파일 TypeScript 컴파일 오류 없음
- [ ] 타입이 백엔드 API 응답 camelCase 필드명과 일치

**의존성**: FE-01

---

#### FE-03. 유틸 함수

**목표**: 할 일 상태 계산 및 날짜 포맷 유틸 작성

**작업 항목**
- [ ] `src/utils/todoStatus.ts` 작성
  - `calcTodoStatus(todo: Todo): TodoStatus` 함수
  - 상태 계산 로직 (DR-STATUS-01 ~ DR-STATUS-04): isCompleted, startDate, endDate, 오늘 날짜 기준
- [ ] `src/utils/dateFormatter.ts` 작성
  - `formatDate(date: string | null): string` 함수 (YYYY-MM-DD → 표시용 포맷)

**완료 조건**
- [ ] `calcTodoStatus()` — 5가지 상태 케이스 각각 올바른 결과 반환 확인
  - isCompleted=true → '완료'
  - isCompleted=false, 날짜 없음 → '진행 중 (날짜 없음)'
  - isCompleted=false, 오늘 < startDate → '시작 전'
  - isCompleted=false, startDate <= 오늘 <= endDate → '진행 중'
  - isCompleted=false, 오늘 > endDate → '기한 초과'

**의존성**: FE-02

---

#### FE-04. API 모듈

**목표**: 백엔드 REST API 호출 함수 작성 (axios 기반)

**작업 항목**
- [ ] axios 인스턴스 생성 (`baseURL = API_BASE_URL`, 요청 인터셉터에서 `Authorization: Bearer <token>` 헤더 자동 주입, 응답 인터셉터에서 401 → 로그인 페이지 리다이렉트)
- [ ] `src/api/authApi.ts` 작성
  - `register({ email, password, name })`: POST `/auth/register`
  - `login({ email, password })`: POST `/auth/login` → `LoginResponse`
- [ ] `src/api/todoApi.ts` 작성
  - `getTodos({ categoryId?, status? })`: GET `/todos`
  - `createTodo(input: CreateTodoInput)`: POST `/todos`
  - `updateTodo(id, input: UpdateTodoInput)`: PUT `/todos/:id`
  - `deleteTodo(id)`: DELETE `/todos/:id`
- [ ] `src/api/userApi.ts` 작성
  - `updateMe({ name?, currentPassword?, newPassword? })`: PUT `/users/me`

**완료 조건**
- [ ] 실행 중인 백엔드에 각 API 함수 호출 시 정상 응답 수신 확인
- [ ] 401 응답 시 로그인 페이지로 리다이렉트 동작 확인

**의존성**: FE-01, FE-02, BE-09

---

#### FE-05. Zustand 인증 스토어

**목표**: 로그인 상태·토큰·사용자 정보 전역 관리

**작업 항목**
- [ ] `src/store/authStore.ts` 작성
  - state: `token: string | null`, `user: User | null`
  - actions: `setAuth(token, user)`, `clearAuth()`
  - `localStorage`에서 토큰 초기화 (새로고침 유지)
  - 로그인 시 `localStorage.setItem('token', token)` 저장
  - 로그아웃 시 `localStorage.removeItem('token')` 제거

**완료 조건**
- [ ] 로그인 후 새로고침 시 인증 상태 유지 확인
- [ ] 로그아웃 후 `token`이 `null`로 초기화 확인

**의존성**: FE-02

---

#### FE-06. TanStack Query 훅

**목표**: 서버 데이터 fetch·캐싱·mutation 훅 작성

**작업 항목**
- [ ] `src/main.tsx`에 `QueryClientProvider` 설정
- [ ] `src/hooks/useAuth.ts` 작성
  - `useLogin()`: `useMutation` (login API 호출 → `authStore.setAuth()`)
  - `useRegister()`: `useMutation` (register API 호출)
- [ ] `src/hooks/useTodos.ts` 작성
  - `useTodos(filters)`: `useQuery` (getTodos API 호출, queryKey에 filters 포함)
- [ ] `src/hooks/useTodoMutations.ts` 작성
  - `useCreateTodo()`: `useMutation` → onSuccess 시 todos 쿼리 invalidate
  - `useUpdateTodo()`: `useMutation` → onSuccess 시 todos 쿼리 invalidate
  - `useDeleteTodo()`: `useMutation` → onSuccess 시 todos 쿼리 invalidate

**완료 조건**
- [ ] `useTodos()` 호출 시 백엔드에서 데이터 fetch 및 캐싱 동작 확인
- [ ] 할 일 생성·수정·삭제 후 목록 자동 갱신 확인

**의존성**: FE-04, FE-05

---

#### FE-07. 공통 UI 컴포넌트

**목표**: 재사용 가능한 기본 컴포넌트 제작

**작업 항목**
- [ ] `src/components/common/Button.tsx`: variant(primary/secondary/danger), disabled, loading 상태
- [ ] `src/components/common/Input.tsx`: label, errorMessage, type 지원
- [ ] `src/components/common/Modal.tsx`: isOpen, onClose, children, 확인 다이얼로그 지원

**완료 조건**
- [ ] 375px ~ 1440px 뷰포트에서 레이아웃 깨짐 없음
- [ ] 각 컴포넌트 variant·상태별 렌더링 정상 확인

**의존성**: FE-01

---

#### FE-08. 공통 레이아웃 (Header)

**목표**: 전체 페이지 공통 헤더 제작

**작업 항목**
- [ ] `src/components/layout/Header.tsx` 작성
  - 로그인 상태: 사용자 이름 표시, 로그아웃 버튼, 내 정보 링크
  - 비로그인 상태: 로그인·회원가입 링크
  - 반응형: 375px ~ 1440px 대응

**완료 조건**
- [ ] 로그인·비로그인 상태별 헤더 UI 정상 렌더링 확인
- [ ] 로그아웃 클릭 시 `authStore.clearAuth()` 호출 및 로그인 페이지 이동 확인

**의존성**: FE-05, FE-07

---

#### FE-09. 인증 페이지 (회원가입 / 로그인)

**목표**: UC-01, UC-02 화면 구현

**작업 항목**
- [ ] `src/pages/RegisterPage.tsx` 작성
  - 이메일·비밀번호·이름 입력 폼
  - 클라이언트 측 유효성 검사 (필수 항목, 형식)
  - `useRegister()` 호출, 성공 시 로그인 페이지 이동
  - 필드별 인라인 오류 메시지 표시
- [ ] `src/pages/LoginPage.tsx` 작성
  - 이메일·비밀번호 입력 폼
  - `useLogin()` 호출, 성공 시 할 일 목록 페이지 이동
  - 오류 메시지 표시 ("이메일 또는 비밀번호가 올바르지 않습니다")

**완료 조건**
- [ ] 정상 회원가입 → 로그인 페이지 이동 확인
- [ ] 이메일 중복 → 409 오류 메시지 표시 확인
- [ ] 정상 로그인 → 할 일 목록 페이지 이동 및 인증 상태 유지 확인
- [ ] 필수 항목 미입력 시 제출 차단 확인
- [ ] 모바일(375px) / 데스크톱(1440px) 레이아웃 정상 확인

**의존성**: FE-06, FE-07, FE-08

---

#### FE-10. 할 일 컴포넌트 및 목록 페이지 (UC-04 ~ UC-07)

**목표**: 할 일 CRUD 전체 화면 구현

**작업 항목**
- [ ] `src/components/todo/TodoFilter.tsx` 작성
  - 카테고리 필터 (전체 / 개별)
  - 상태 필터 (전체 / 시작 전 / 진행 중 / 완료 / 기한 초과)
- [ ] `src/components/todo/TodoItem.tsx` 작성
  - 제목·상태·카테고리·날짜 표시 (`calcTodoStatus()` 사용)
  - 수정·삭제 버튼 (삭제 시 Modal 확인 다이얼로그)
  - 완료 여부 토글 체크박스
- [ ] `src/components/todo/TodoList.tsx` 작성
  - `useTodos()` 훅 사용
  - 빈 목록 시 "등록된 할 일이 없습니다" 표시
- [ ] `src/components/todo/TodoForm.tsx` 작성
  - 제목(필수), 설명(선택), 카테고리 선택, 시작일·종료일 캘린더 선택
  - 등록 / 수정 모드 공용 (기존 데이터 미리 채우기)
  - 날짜 유효성: end_date >= start_date (DR-TODO-03)
  - `useCreateTodo()` / `useUpdateTodo()` 호출
- [ ] `src/pages/TodoListPage.tsx` 작성
  - `TodoFilter`, `TodoList`, `TodoForm` 통합
  - 미인증 접근 시 로그인 페이지 리다이렉트

**완료 조건**
- [ ] 할 일 등록 → 목록 즉시 반영 확인
- [ ] 카테고리·상태 필터 변경 시 목록 정상 필터링 확인
- [ ] 할 일 수정 → 기존 데이터 폼에 미리 채워짐 확인
- [ ] 삭제 확인 다이얼로그 → 확인 시 삭제 처리 확인
- [ ] 5가지 상태 각각 올바른 배지/텍스트 표시 확인
- [ ] `end_date < start_date` 입력 시 "종료일자는 시작일자 이후여야 합니다" 메시지 표시 확인
- [ ] 모바일(375px) / 데스크톱(1440px) 레이아웃 정상 확인

**의존성**: FE-06, FE-07, FE-08

---

#### FE-11. 내 정보 페이지 (UC-03 v1.0)

**목표**: 이름·비밀번호 수정 화면 구현

**작업 항목**
- [ ] `src/pages/ProfilePage.tsx` 작성
  - 현재 이름 표시 및 수정 인풋
  - 현재 비밀번호·신규 비밀번호·확인 인풋
  - `userApi.updateMe()` 호출, 성공 시 메시지 표시
  - 현재 비밀번호 불일치 시 인라인 오류 표시

**완료 조건**
- [ ] 이름 수정 → 헤더 사용자명 즉시 반영 확인
- [ ] 비밀번호 변경 → 변경된 비밀번호로 재로그인 성공 확인
- [ ] 현재 비밀번호 불일치 → 오류 메시지 표시 확인

**의존성**: FE-06, FE-07, FE-08

---

#### FE-12. 라우터 설정 및 보호 라우트

**목표**: React Router 설정 및 인증 기반 라우트 가드 적용

**작업 항목**
- [ ] `src/App.tsx` 작성
  - `/login` → `LoginPage`
  - `/register` → `RegisterPage`
  - `/todos` → `TodoListPage` (인증 필요)
  - `/profile` → `ProfilePage` (인증 필요)
  - `/` → `/todos` 리다이렉트
- [ ] 보호 라우트 컴포넌트 작성: 비인증 시 `/login` 리다이렉트

**완료 조건**
- [ ] 비인증 상태에서 `/todos` 접근 시 `/login` 리다이렉트 확인
- [ ] 로그인 후 `/login` 접근 시 `/todos` 리다이렉트 확인

**의존성**: FE-09, FE-10, FE-11

---

#### FE-13. v1.0 통합 검증

**목표**: v1.0 전체 흐름 E2E 검증

**작업 항목**
- [ ] 회원가입 → 로그인 → 할 일 등록 → 목록 확인 → 수정 → 삭제 전체 흐름 수동 테스트
- [ ] 필터 기능 (카테고리·상태) 동작 확인
- [ ] 내 정보 수정 (이름·비밀번호) 동작 확인
- [ ] 375px (모바일) / 768px (태블릿) / 1440px (데스크톱) 반응형 레이아웃 확인
- [ ] 미인증 접근 라우트 보호 확인
- [ ] JWT 만료 시 로그인 페이지 이동 확인

**완료 조건**
- [ ] 전체 유스케이스 UC-01 ~ UC-07 정상 동작 확인
- [ ] 콘솔 오류 없음
- [ ] 반응형 375px ~ 1440px 레이아웃 깨짐 없음

**의존성**: FE-12

---

## Phase 2 — v2.0 확장 기능

> **착수 조건**: FE-13 (v1.0 통합 검증) 완료 후 착수

---

### [DB] 데이터베이스 (v2.0)

---

#### DB-04. v2.0 마이그레이션 — theme·language 컬럼

**목표**: users 테이블에 `theme`, `language` 컬럼 추가 (이미 schema.sql에 포함되어 있으므로 마이그레이션 파일만 별도 작성)

**작업 항목**
- [ ] `backend/src/db/migrations/004_add_theme_language_to_users.sql` 작성
  - `ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark'));`
  - `ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) NOT NULL DEFAULT 'ko' CHECK (language IN ('ko', 'en'));`
- [ ] 마이그레이션 실행 및 컬럼 추가 확인

**완료 조건**
- [ ] 기존 users 레코드에 `theme='light'`, `language='ko'` 기본값 적용 확인
- [ ] `theme = 'invalid'` 입력 시 CHECK 제약 오류 발생 확인

**의존성**: DB-03, FE-13

---

### [BE] 백엔드 (v2.0)

---

#### BE-10. 내 정보 수정 API 확장 (UC-03 v2.0)

**목표**: `PUT /api/users/me`에 `theme`, `language` 필드 추가

**작업 항목**
- [ ] `src/repositories/userRepository.js` — `updateUser()` 수정
  - `theme`, `language` 필드 수정 지원
- [ ] `src/services/userService.js` — `theme`, `language` 유효성 검사 추가
  - theme: `'light'` | `'dark'` 외 값 → 400
  - language: `'ko'` | `'en'` 외 값 → 400, 지원하지 않는 코드는 `'ko'` 적용 (UC-09 예외 처리)
- [ ] `src/controllers/userController.js` — body에서 `theme`, `language` 파싱 추가
- [ ] 로그인 API 응답에 `theme`, `language` 포함 확인 (프론트엔드 자동 복원용)

**완료 조건**
- [ ] `PUT /api/users/me { theme: 'dark' }` → DB 반영 확인
- [ ] `PUT /api/users/me { language: 'en' }` → DB 반영 확인
- [ ] `POST /api/auth/login` 응답에 `user.theme`, `user.language` 포함 확인
- [ ] 유효하지 않은 값 요청 → `400` 응답

**의존성**: BE-07, DB-04

---

### [FE] 프론트엔드 (v2.0)

---

#### FE-14. i18n 라이브러리 설정 및 번역 리소스

**목표**: 다국어(ko/en) 지원 기반 구성

**작업 항목**
- [ ] i18n 라이브러리 설치 (예: `react-i18next` + `i18next`)
- [ ] `src/locales/ko.json` 작성: 전체 UI 텍스트 한국어 키-값
- [ ] `src/locales/en.json` 작성: 전체 UI 텍스트 영어 키-값
- [ ] i18n 초기화 설정: 기본 언어 `ko`, 리소스 로드
- [ ] `src/main.tsx`에 i18n 초기화 import

**완료 조건**
- [ ] `useTranslation()` 훅으로 한국어·영어 텍스트 전환 확인
- [ ] 지원하지 않는 언어 코드 → 기본값 `ko` 적용 확인

**의존성**: FE-01

---

#### FE-15. Zustand 스토어 확장 (theme·language)

**목표**: 인증 스토어에 테마·언어 전역 상태 추가

**작업 항목**
- [ ] `src/store/authStore.ts` 확장
  - state 추가: `theme: 'light' | 'dark'`, `language: 'ko' | 'en'`
  - actions 추가: `setTheme(theme)`, `setLanguage(language)`
  - 미로그인 시: `localStorage`에서 theme·language 초기화 (DR-USER-03)
  - 로그인 후: 서버 값(`user.theme`, `user.language`)으로 덮어쓰기 (DR-USER-03)
- [ ] `setTheme()` 호출 시 `document.documentElement`에 `data-theme` 속성 적용 (CSS 테마 전환)
- [ ] `setLanguage()` 호출 시 `i18n.changeLanguage()` 연동

**완료 조건**
- [ ] 미로그인 상태 테마 변경 → localStorage 저장 확인
- [ ] 로그인 후 서버 theme 값으로 덮어쓰기 확인
- [ ] `setTheme('dark')` 호출 시 `document.documentElement.dataset.theme = 'dark'` 적용 확인

**의존성**: FE-05, FE-14, BE-10

---

#### FE-16. 테마 토글 UI (UC-08)

**목표**: Dark / Light 테마 전환 UI 및 DB 저장 연동

**작업 항목**
- [ ] `Header.tsx`에 테마 토글 버튼 추가
- [ ] 토글 클릭 시 `authStore.setTheme()` 호출 → 즉시 전체 UI 적용
- [ ] 로그인 상태: `userApi.updateMe({ theme })` 호출로 DB 저장
- [ ] DB 저장 실패 시: UI 적용은 유지, 토스트 알림 표시
- [ ] CSS: `data-theme` 속성 기반 Dark/Light 스타일 변수 정의
- [ ] `ProfilePage.tsx`에도 테마 선택 UI 추가 (UC-03 확장)

**완료 조건**
- [ ] 테마 토글 클릭 즉시 전체 UI 색상 전환 확인
- [ ] 로그인 후 테마 변경 → DB 저장 → 재로그인 시 해당 테마로 자동 복원 확인
- [ ] 미로그인 상태 테마 변경 → localStorage 저장 → 로그인 후 DB 값으로 덮어쓰기 확인
- [ ] DB 저장 실패 시 토스트 알림 표시 확인

**의존성**: FE-15, BE-10

---

#### FE-17. 언어 전환 UI (UC-09)

**목표**: 한국어 / 영어 전환 UI 및 DB 저장 연동

**작업 항목**
- [ ] `Header.tsx`에 언어 선택 버튼(ko/en) 추가
- [ ] 언어 선택 시 `authStore.setLanguage()` 호출 → `i18n.changeLanguage()` 즉시 UI 전환
- [ ] 로그인 상태: `userApi.updateMe({ language })` 호출로 DB 저장
- [ ] DB 저장 실패 시: UI 적용은 유지, 토스트 알림 표시
- [ ] `ProfilePage.tsx`에도 언어 선택 UI 추가 (UC-03 확장)

**완료 조건**
- [ ] 언어 전환 클릭 즉시 전체 UI 텍스트 언어 변경 확인
- [ ] 로그인 후 언어 변경 → DB 저장 → 재로그인 시 해당 언어로 자동 복원 확인
- [ ] 미로그인 상태 언어 변경 → localStorage 저장 확인

**의존성**: FE-15, BE-10

---

#### FE-18. v2.0 통합 검증

**목표**: v2.0 전체 흐름 E2E 검증

**작업 항목**
- [ ] 테마 변경 → 즉시 UI 적용 → 로그아웃 → 재로그인 후 테마 유지 확인
- [ ] 언어 변경 → 즉시 UI 텍스트 전환 → 재로그인 후 언어 유지 확인
- [ ] 미로그인 테마·언어 변경 → 로그인 후 서버 값으로 덮어쓰기 확인
- [ ] 내 정보 페이지에서 테마·언어 변경 동작 확인
- [ ] v1.0 기능 회귀 없음 확인

**완료 조건**
- [ ] UC-08, UC-09 정상 동작 확인
- [ ] v1.0 전체 기능 정상 동작 (회귀 없음) 확인
- [ ] 375px ~ 1440px 반응형 레이아웃 깨짐 없음

**의존성**: FE-16, FE-17

---

## Task 의존성 요약

```
DB-01 → DB-02 → DB-03
                   ↓
BE-01 → BE-02 ──── ┤
BE-01 → BE-03      │
BE-01 → BE-04      │
                   ↓
         BE-05 (회원가입) → BE-06 (로그인) → BE-07 (내 정보)
                                           → BE-08 (할 일 CRUD)
         BE-05 → BE-08a (카테고리 CRUD)
                   BE-05, BE-06, BE-07, BE-08, BE-08a → BE-09 (통합)
                                                    ↓
FE-01 → FE-02 → FE-03                         (백엔드 준비)
FE-01 → FE-02 → FE-04 ← BE-09
FE-01 → FE-05
FE-04, FE-05 → FE-06
FE-01 → FE-07
FE-05, FE-07 → FE-08
FE-06, FE-07, FE-08 → FE-09 → FE-12
FE-06, FE-07, FE-08 → FE-10 → FE-12
FE-06, FE-07, FE-08 → FE-11 → FE-12
FE-12 → FE-13

─── v1.0 완료 ───────────────────────────────────────────────

FE-13 → DB-04 → BE-10
FE-01 → FE-14
FE-05, FE-14, BE-10 → FE-15
FE-15, BE-10 → FE-16
FE-15, BE-10 → FE-17
FE-16, FE-17 → FE-18
```

---

## Task 목록 요약

| ID | 레이어 | Task | 단계 |
|----|--------|------|------|
| DB-01 | DB | 로컬 DB 환경 구성 | v1.0 |
| DB-02 | DB | v1.0 마이그레이션 파일 작성 | v1.0 |
| DB-03 | DB | 스키마 적용 및 검증 | v1.0 |
| BE-01 | BE | 프로젝트 초기화 | v1.0 |
| BE-02 | BE | DB 연결 풀 설정 | v1.0 |
| BE-03 | BE | 공통 미들웨어 구성 | v1.0 |
| BE-04 | BE | 공통 유틸 함수 | v1.0 |
| BE-05 | BE | 회원가입 API | v1.0 |
| BE-06 | BE | 로그인 API | v1.0 |
| BE-07 | BE | 내 정보 수정 API | v1.0 |
| BE-08 | BE | 할 일 CRUD API | v1.0 |
| BE-08a | BE | 카테고리 CRUD API | v1.0 |
| BE-09 | BE | 라우터 통합 및 서버 기동 검증 | v1.0 |
| FE-01 | FE | 프로젝트 초기화 | v1.0 |
| FE-02 | FE | TypeScript 타입 정의 | v1.0 |
| FE-03 | FE | 유틸 함수 | v1.0 |
| FE-04 | FE | API 모듈 | v1.0 |
| FE-05 | FE | Zustand 인증 스토어 | v1.0 |
| FE-06 | FE | TanStack Query 훅 | v1.0 |
| FE-07 | FE | 공통 UI 컴포넌트 | v1.0 |
| FE-08 | FE | 공통 레이아웃 (Header) | v1.0 |
| FE-09 | FE | 인증 페이지 (회원가입/로그인) | v1.0 |
| FE-10 | FE | 할 일 컴포넌트 및 목록 페이지 | v1.0 |
| FE-11 | FE | 내 정보 페이지 | v1.0 |
| FE-12 | FE | 라우터 설정 및 보호 라우트 | v1.0 |
| FE-13 | FE | v1.0 통합 검증 | v1.0 |
| DB-04 | DB | v2.0 마이그레이션 (theme·language) | v2.0 |
| BE-10 | BE | 내 정보 수정 API 확장 | v2.0 |
| FE-14 | FE | i18n 라이브러리 설정 | v2.0 |
| FE-15 | FE | Zustand 스토어 확장 (theme·language) | v2.0 |
| FE-16 | FE | 테마 토글 UI | v2.0 |
| FE-17 | FE | 언어 전환 UI | v2.0 |
| FE-18 | FE | v2.0 통합 검증 | v2.0 |
