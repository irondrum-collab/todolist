# 프론트엔드 통합 가이드

| 항목 | 내용 |
|------|------|
| 버전 | 1.0 |
| 작성일 | 2026-05-28 |
| 참조 | `backend/swagger.json`, `docs/1-domain-definition.md v1.3`, `docs/2-PRD.md v2.1` |

---

## 1. 프로젝트 환경 설정

### 1.1 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | React | 19 |
| 언어 | TypeScript | 5+ |
| 빌드 도구 | Vite | 최신 |
| 상태 관리 (클라이언트) | Zustand | 최신 |
| 서버 상태 관리 | TanStack Query (React Query) | 최신 |
| HTTP 클라이언트 | axios | 최신 |
| 라우팅 | react-router-dom | 최신 |
| 다국어 (v2.0) | i18n 라이브러리 | 최신 |

### 1.2 환경변수 (.env)

```
VITE_API_BASE_URL=http://localhost:3000/api
```

코드에서 접근:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

### 1.3 개발 서버

- 프론트엔드 Vite 개발 서버 포트: **5173**
- 백엔드 API 서버 포트: **3000**
- Swagger UI: `http://localhost:3000/api-docs`
- 헬스체크: `GET http://localhost:3000/health` → `{ "status": "ok" }`

---

## 2. 디렉토리 구조

```
frontend/
├── src/
│   ├── api/                     # axios 기반 API 호출 함수
│   │   ├── authApi.ts
│   │   ├── todoApi.ts
│   │   ├── categoryApi.ts
│   │   └── userApi.ts
│   ├── components/
│   │   ├── common/              # 범용 UI 컴포넌트 (Button, Input, Modal 등)
│   │   ├── todo/                # 할 일 관련 컴포넌트
│   │   └── layout/              # Header 등 레이아웃 컴포넌트
│   ├── hooks/                   # TanStack Query 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useTodos.ts
│   │   └── useCategories.ts
│   ├── pages/                   # 라우트 페이지
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── TodoListPage.tsx
│   │   └── ProfilePage.tsx
│   ├── store/                   # Zustand 전역 상태
│   │   └── authStore.ts
│   ├── types/                   # TypeScript 타입 정의
│   │   ├── todo.ts
│   │   └── user.ts
│   ├── utils/                   # 순수 유틸 함수
│   │   ├── todoStatus.ts        # 할 일 상태 계산
│   │   └── dateFormatter.ts
│   ├── locales/                 # [v2.0] 다국어 리소스
│   │   ├── ko.json
│   │   └── en.json
│   ├── constants.ts
│   ├── App.tsx
│   └── main.tsx
```

### 2.1 코드 스타일

- 들여쓰기: 스페이스 2칸
- 세미콜론 사용
- 문자열: 작은따옴표 (`'`)
- 컴포넌트 파일명: PascalCase (`TodoItem.tsx`)
- 일반 모듈 파일명: camelCase (`todoApi.ts`)
- 커스텀 훅: `use` 접두사 (`useTodos`, `useAuthStore`)
- 타입·인터페이스: PascalCase (`Todo`, `User`)
- 상수: UPPER_SNAKE_CASE (`MAX_TITLE_LENGTH`)

---

## 3. 인증 (Authentication)

### 3.1 방식

JWT Bearer Token 인증. 로그인 성공 시 발급된 토큰을 이후 모든 인증 필요 요청의 헤더에 포함한다.

```
Authorization: Bearer <token>
```

### 3.2 토큰 관리

- **저장**: `localStorage.setItem('token', token)` — 로그인 성공 시
- **삭제**: `localStorage.removeItem('token')` — 로그아웃 또는 401 수신 시
- **복원**: 앱 초기화 시 `localStorage`에서 토큰 자동 로드

### 3.3 토큰 만료

- 기본 만료: **7일** (서버 설정 `JWT_EXPIRES_IN`)
- 만료된 토큰으로 요청 시 **401** 응답
- 401 수신 시 인증 상태 초기화 후 로그인 페이지로 리다이렉트

### 3.4 axios 인스턴스 설정 (권장)

```typescript
// src/api/axiosInstance.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 요청 인터셉터: 토큰 자동 주입
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터: 401 처리
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
```

---

## 4. API 엔드포인트

> 전체 인터랙티브 명세: `http://localhost:3000/api-docs`

### 4.1 인증 (Auth)

#### POST /api/auth/register — 회원가입

인증 불필요.

**요청**:
```json
{
  "email": "user@example.com",
  "password": "Pass123!",
  "name": "홍길동"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| `email` | string | Y | RFC 5322 형식, 최대 254자 |
| `password` | string | Y | 8~128자, 영문·숫자·특수문자 각 1자 이상 |
| `name` | string | Y | 1~50자 |

**응답 201**:
```json
{ "message": "회원가입이 완료되었습니다." }
```

**에러**:
- `400`: 입력값 형식 오류
- `409`: 이메일 중복 → `{ "message": "이미 사용 중인 이메일입니다" }`

---

#### POST /api/auth/login — 로그인

인증 불필요.

**요청**:
```json
{
  "email": "user@example.com",
  "password": "Pass123!"
}
```

**응답 200**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "theme": "light",
    "language": "ko",
    "createdAt": "2026-05-28T00:00:00.000Z"
  }
}
```

**에러**:
- `401`: 이메일 미존재 또는 비밀번호 불일치 → `{ "message": "이메일 또는 비밀번호가 올바르지 않습니다" }`

---

### 4.2 사용자 (Users)

#### PUT /api/users/me — 내 정보 수정

인증 필수. 모든 필드 선택. 비밀번호 변경 시 `currentPassword` + `newPassword` 쌍으로 전송.

**요청**:
```json
{
  "name": "새이름",
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456@",
  "theme": "dark",
  "language": "en"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| `name` | string | N | 1~50자 |
| `currentPassword` | string | 조건부 | 비밀번호 변경 시 필수 |
| `newPassword` | string | 조건부 | 8~128자, 영문·숫자·특수문자 각 1자 이상 |
| `theme` | string | N | `"light"` \| `"dark"` |
| `language` | string | N | `"ko"` \| `"en"` |

**응답 200**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "새이름",
    "theme": "dark",
    "language": "en",
    "createdAt": "2026-05-28T00:00:00.000Z"
  }
}
```

**에러**:
- `400`: 입력값 오류
- `401`: 미인증 / 현재 비밀번호 불일치

---

### 4.3 할 일 (Todos)

#### POST /api/todos — 할 일 등록

인증 필수.

**요청**:
```json
{
  "title": "프로젝트 기획서 작성",
  "description": "1분기 사업계획 포함",
  "categoryId": 1,
  "startDate": "2026-05-28",
  "endDate": "2026-06-03"
}
```

| 필드 | 타입 | 필수 | 제약 |
|------|------|------|------|
| `title` | string | Y | 1~100자 |
| `description` | string | N | 최대 1,000자 |
| `categoryId` | integer | N | 미지정 시 '기본' 카테고리 자동 적용 |
| `startDate` | string | N | `YYYY-MM-DD` |
| `endDate` | string | N | `YYYY-MM-DD`, `endDate >= startDate` |

**응답 201**:
```json
{
  "todo": {
    "id": 1,
    "title": "프로젝트 기획서 작성",
    "description": "1분기 사업계획 포함",
    "startDate": "2026-05-28",
    "endDate": "2026-06-03",
    "isCompleted": false,
    "status": "진행 중",
    "categoryId": 1,
    "userId": 1,
    "createdAt": "2026-05-28T00:00:00.000Z",
    "updatedAt": "2026-05-28T00:00:00.000Z"
  }
}
```

---

#### GET /api/todos — 할 일 목록 조회

인증 필수.

**쿼리 파라미터** (모두 선택):

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `categoryId` | integer | 카테고리 ID로 필터링 |
| `status` | string | 상태로 필터링: `시작 전` \| `진행 중` \| `완료` \| `기한 초과` |

**응답 200**:
```json
{
  "todos": [ /* Todo[] */ ]
}
```

---

#### PUT /api/todos/{id} — 할 일 수정

인증 필수. 모든 필드 선택. `description`, `startDate`, `endDate`는 `null` 전송으로 삭제 가능.

**요청**:
```json
{
  "title": "수정된 제목",
  "description": null,
  "categoryId": 2,
  "startDate": "2026-06-01",
  "endDate": null,
  "isCompleted": true
}
```

**응답 200**: `{ "todo": { /* Todo */ } }`

**에러**:
- `403`: 타인 소유 → `{ "message": "수정 권한이 없습니다" }`
- `404`: 존재하지 않는 할 일

---

#### DELETE /api/todos/{id} — 할 일 삭제

인증 필수.

**응답 200**: `{ "message": "삭제되었습니다." }`

**에러**:
- `403`: 타인 소유 → `{ "message": "삭제 권한이 없습니다" }`
- `404`: 존재하지 않는 할 일

---

### 4.4 카테고리 (Categories)

#### GET /api/categories — 카테고리 목록 조회

인증 필수.

**응답 200**:
```json
{
  "categories": [
    { "id": 1, "name": "기본", "userId": 1 },
    { "id": 2, "name": "업무", "userId": 1 }
  ]
}
```

---

#### POST /api/categories — 카테고리 등록

인증 필수.

**요청**: `{ "name": "업무" }` (1~30자)

**응답 201**: `{ "category": { "id": 2, "name": "업무", "userId": 1 } }`

---

#### PUT /api/categories/{id} — 카테고리 수정

인증 필수. **'기본' 카테고리 수정 불가**.

**요청**: `{ "name": "개인" }` (1~30자)

**응답 200**: `{ "category": { /* Category */ } }`

**에러**:
- `400`: '기본' 카테고리 수정 시도
- `403`: 타인 소유
- `404`: 존재하지 않는 카테고리

---

#### DELETE /api/categories/{id} — 카테고리 삭제

인증 필수. **'기본' 카테고리 삭제 불가**. 삭제 시 소속 할 일도 연쇄 삭제.

**응답 204**: 본문 없음

**에러**:
- `400`: '기본' 카테고리 삭제 시도
- `403`: 타인 소유
- `404`: 존재하지 않는 카테고리

---

## 5. 에러 응답 형식

모든 에러 응답은 동일한 형식을 사용한다:

```json
{ "message": "에러 설명 메시지" }
```

| HTTP 상태 | 상황 |
|----------|------|
| `400` | 입력값 형식 오류, 제약 위반, '기본' 카테고리 수정·삭제 시도 |
| `401` | 토큰 없음 / 만료 / 유효하지 않음 / 현재 비밀번호 불일치 |
| `403` | 타인의 리소스 접근 시도 |
| `404` | 리소스 없음 |
| `409` | 이메일 중복 |
| `500` | 서버 내부 오류 |

---

## 6. TypeScript 타입 정의

### 6.1 사용자 (`src/types/user.ts`)

```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  theme: 'light' | 'dark';
  language: 'ko' | 'en';
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateUserInput {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  theme?: 'light' | 'dark';
  language?: 'ko' | 'en';
}
```

### 6.2 할 일 (`src/types/todo.ts`)

```typescript
export type TodoStatus =
  | '시작 전'
  | '진행 중'
  | '완료'
  | '기한 초과'
  | '진행 중 (날짜 없음)';

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  startDate: string | null;   // YYYY-MM-DD
  endDate: string | null;     // YYYY-MM-DD
  isCompleted: boolean;
  status: TodoStatus;
  categoryId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  categoryId?: number;
  startDate?: string | null;
  endDate?: string | null;
  isCompleted?: boolean;
}

export interface Category {
  id: number;
  name: string;
  userId: number;
}
```

---

## 7. 할 일 상태 계산 (`src/utils/todoStatus.ts`)

상태는 백엔드에서 계산하여 응답에 포함(`status` 필드)한다. 클라이언트에서 직접 계산이 필요한 경우 아래 로직을 사용한다.

```typescript
export function calcTodoStatus(todo: Pick<Todo, 'isCompleted' | 'startDate' | 'endDate'>): TodoStatus {
  if (todo.isCompleted) return '완료';
  if (!todo.startDate && !todo.endDate) return '진행 중 (날짜 없음)';

  const today = new Date().toISOString().split('T')[0];

  if (todo.startDate && today < todo.startDate) return '시작 전';
  if (todo.endDate && today > todo.endDate) return '기한 초과';
  return '진행 중';
}
```

**상태 결정 규칙 요약**:

| 상태 | 조건 |
|------|------|
| 완료 | `isCompleted = true` |
| 진행 중 (날짜 없음) | `isCompleted = false`, 시작일·종료일 모두 없음 |
| 시작 전 | `isCompleted = false`, 오늘 < 시작일 |
| 진행 중 | `isCompleted = false`, 시작일 ≤ 오늘 ≤ 종료일 |
| 기한 초과 | `isCompleted = false`, 오늘 > 종료일 |

---

## 8. Zustand 인증 스토어 (`src/store/authStore.ts`)

```typescript
import { create } from 'zustand';
import { User } from '../types/user';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,

  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  updateUser: (user) => set({ user }),
}));
```

---

## 9. CORS 설정

백엔드는 `CORS_ORIGIN=http://localhost:5173`으로 프론트엔드 개발 서버만 허용한다. 별도 프록시 설정 없이 직접 `http://localhost:3000`으로 요청한다.

Vite `vite.config.ts`에서 프록시를 설정하는 경우 `VITE_API_BASE_URL`을 `/api`로 변경하고 아래 설정을 추가한다:

```typescript
// vite.config.ts (프록시 사용 시)
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```

---

## 10. 라우팅 구조 (권장)

| 경로 | 페이지 | 인증 필요 |
|------|--------|----------|
| `/login` | LoginPage | N |
| `/register` | RegisterPage | N |
| `/` | TodoListPage | Y |
| `/profile` | ProfilePage | Y |

인증 필요 경로에는 PrivateRoute 패턴을 적용하여 미인증 사용자를 `/login`으로 리다이렉트한다.

---

## 11. v2.0 확장 사항

### 11.1 테마 (Dark/Light Mode)

- 로그인 응답 `user.theme` 값으로 초기 테마 설정
- 테마 변경 시 `PUT /api/users/me` 호출하여 DB에 저장
- 미로그인 상태: `localStorage`에 임시 저장, 로그인 후 DB 값으로 덮어씀
- 지원 값: `"light"` (기본값) | `"dark"`

### 11.2 다국어 (i18n)

- 로그인 응답 `user.language` 값으로 초기 언어 설정
- 언어 변경 시 `PUT /api/users/me` 호출하여 DB에 저장
- 미로그인 상태: `localStorage`에 임시 저장
- 지원 언어: `"ko"` (기본값, 한국어) | `"en"` (영어)
