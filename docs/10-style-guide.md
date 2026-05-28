# 프론트엔드 스타일 가이드

| 항목 | 내용 |
|------|------|
| 버전 | 1.0 |
| 작성일 | 2026-05-28 |
| 레퍼런스 | Gmail (Google Material Design 3) |

---

## 1. 레이아웃

### 1.1 전체 구조

Gmail과 동일한 2열 레이아웃을 사용한다.

```
┌─────────────────────────────────────────────────────────┐
│                       Header (64px)                     │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│   Sidebar    │           Main Content                   │
│   (256px)    │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

| 영역 | 너비 | 설명 |
|------|------|------|
| Header | 100% / 64px 고정 높이 | 로고, 검색, 사용자 메뉴 |
| Sidebar | 256px 고정 (모바일 숨김) | 카테고리 목록, 상태 필터 |
| Main Content | 나머지 영역 전체 | 할 일 목록 |

### 1.2 반응형 브레이크포인트

| 이름 | 범위 | 사이드바 |
|------|------|---------|
| mobile | ~ 767px | 숨김 (햄버거 메뉴로 토글) |
| tablet | 768px ~ 1023px | 숨김 (햄버거 메뉴로 토글) |
| desktop | 1024px ~ | 항상 표시 |

### 1.3 간격 시스템

8px 기반 그리드를 사용한다.

| 토큰 | 값 | 용도 |
|------|-----|------|
| `space-1` | 4px | 아이콘 내부 여백 |
| `space-2` | 8px | 컴포넌트 내부 패딩 |
| `space-3` | 12px | 인라인 요소 간격 |
| `space-4` | 16px | 카드·리스트 아이템 패딩 |
| `space-6` | 24px | 섹션 간격 |
| `space-8` | 32px | 페이지 여백 |

---

## 2. 색상

### 2.1 팔레트

| 토큰 | 값 | 용도 |
|------|----|------|
| `color-primary` | `#1a73e8` | 주요 버튼, 활성 상태, 링크 |
| `color-primary-hover` | `#1557b0` | 주요 버튼 hover |
| `color-primary-light` | `#d3e3fd` | 선택된 사이드바 항목 배경 |
| `color-surface` | `#ffffff` | 카드, 사이드바, 헤더 배경 |
| `color-background` | `#f6f8fc` | 페이지 전체 배경 |
| `color-hover` | `#f1f3f4` | 리스트 행 hover 배경 |
| `color-border` | `#e0e0e0` | 구분선, 입력 테두리 |
| `color-text-primary` | `#202124` | 본문 텍스트 |
| `color-text-secondary` | `#5f6368` | 부제목, 힌트 텍스트 |
| `color-text-disabled` | `#bdbdbd` | 비활성 텍스트 |
| `color-error` | `#d93025` | 에러 메시지, 위험 버튼 |
| `color-success` | `#1e8e3e` | 완료 상태 |
| `color-warning` | `#f9ab00` | 기한 임박 경고 |

### 2.2 상태별 색상

| 할 일 상태 | 배지 색상 | 배경 |
|-----------|----------|------|
| 시작 전 | `#5f6368` | `#f1f3f4` |
| 진행 중 | `#1a73e8` | `#d3e3fd` |
| 완료 | `#1e8e3e` | `#e6f4ea` |
| 기한 초과 | `#d93025` | `#fce8e6` |
| 진행 중 (날짜 없음) | `#f9ab00` | `#fef7e0` |

### 2.3 다크 모드 (v2.0)

| 라이트 토큰 | 다크 값 |
|------------|---------|
| `color-surface` | `#1f1f1f` |
| `color-background` | `#121212` |
| `color-hover` | `#2a2a2a` |
| `color-border` | `#3c3c3c` |
| `color-text-primary` | `#e8eaed` |
| `color-text-secondary` | `#9aa0a6` |

---

## 3. 타이포그래피

### 3.1 폰트

```css
font-family: 'Google Sans', 'Noto Sans KR', Roboto, Arial, sans-serif;
```

- 영문/UI: `Google Sans` (없으면 `Roboto`)
- 한국어: `Noto Sans KR`

### 3.2 타입 스케일

| 토큰 | 크기 | 굵기 | 행간 | 용도 |
|------|------|------|------|------|
| `text-xl` | 20px | 500 | 28px | 페이지 제목 |
| `text-lg` | 16px | 500 | 24px | 섹션 제목, 발신자명 |
| `text-base` | 14px | 400 | 20px | 본문, 리스트 아이템 |
| `text-sm` | 12px | 400 | 16px | 날짜, 배지, 힌트 |

---

## 4. 컴포넌트

### 4.1 버튼

**Primary 버튼** (예: 할 일 추가)

```
배경: color-primary (#1a73e8)
텍스트: #ffffff
border-radius: 24px
padding: 8px 24px
height: 40px
font-size: 14px, font-weight: 500
hover: color-primary-hover (#1557b0)
```

**Text 버튼** (예: 취소)

```
배경: 없음
텍스트: color-primary
border-radius: 24px
padding: 8px 16px
hover 배경: color-primary-light (#d3e3fd)
```

**Danger 버튼** (예: 삭제 확인)

```
배경: color-error (#d93025)
텍스트: #ffffff
border-radius: 24px
padding: 8px 24px
```

**FAB (Floating Action Button)** — 모바일 할 일 추가

```
배경: color-primary-light (#d3e3fd)
아이콘 색: color-primary (#1a73e8)
width: 56px, height: 56px
border-radius: 16px
box-shadow: 0 2px 6px rgba(0,0,0,0.15)
```

### 4.2 사이드바

```
너비: 256px
배경: color-surface (#ffffff)
padding: 8px 0

사이드바 항목:
  height: 40px
  padding: 0 16px
  border-radius: 0 24px 24px 0  (오른쪽만 둥글게)
  font-size: 14px

활성 항목:
  배경: color-primary-light (#d3e3fd)
  텍스트: color-primary (#1a73e8)
  font-weight: 600

비활성 항목 hover:
  배경: color-hover (#f1f3f4)
```

### 4.3 할 일 리스트 행 (TodoItem)

Gmail 메일 목록 행과 동일한 구조를 사용한다.

```
height: 40px ~ 48px (콘텐츠에 따라 유동)
padding: 0 16px
border-bottom: 1px solid color-border
cursor: pointer

hover:
  배경: color-hover (#f1f3f4)
  액션 아이콘 표시 (수정, 삭제)

읽지 않음 (미완료):
  font-weight: 500

읽음 (완료):
  font-weight: 400
  텍스트 색: color-text-secondary
  text-decoration: line-through (선택)
```

**행 내부 구조**:

```
[체크박스] [제목 (flex-grow)] [카테고리 배지] [상태 배지] [날짜] [액션 아이콘]
```

### 4.4 체크박스

```
size: 18px × 18px
border: 2px solid #5f6368
border-radius: 50% (원형)
checked:
  배경: color-primary
  border-color: color-primary
  체크 아이콘: 흰색
```

### 4.5 배지 (Badge)

상태 표시에 사용.

```
padding: 2px 10px
border-radius: 12px
font-size: 12px
font-weight: 500
```

색상은 [2.2 상태별 색상] 참조.

### 4.6 입력 필드 (Input)

```
height: 40px
border: 1px solid color-border (#e0e0e0)
border-radius: 4px
padding: 0 12px
font-size: 14px
background: color-surface

focus:
  border-color: color-primary (#1a73e8)
  outline: none
  box-shadow: 0 0 0 2px rgba(26,115,232,0.2)

error:
  border-color: color-error (#d93025)
```

### 4.7 모달 / 다이얼로그

할 일 등록·수정, 삭제 확인에 사용.

```
배경: color-surface (#ffffff)
border-radius: 8px
box-shadow: 0 4px 24px rgba(0,0,0,0.15)
padding: 24px
max-width: 480px
width: 100%

오버레이: rgba(0,0,0,0.4)
```

### 4.8 탭 (Tab)

목록 페이지 상태 필터 탭에 사용 (Gmail 상단 탭 참조).

```
height: 48px
font-size: 14px
font-weight: 500
color: color-text-secondary (비활성)
color: color-primary (활성)
border-bottom: 3px solid color-primary (활성)
padding: 0 16px
```

### 4.9 헤더

```
height: 64px
배경: color-surface (#ffffff)
border-bottom: 1px solid color-border
padding: 0 16px
box-shadow: 0 1px 3px rgba(0,0,0,0.08)
position: sticky, top: 0
z-index: 100
```

---

## 5. 아이콘

Material Symbols (Google 아이콘) 사용.

```
패키지: @mui/icons-material 또는 material-symbols CSS
기본 크기: 20px (리스트 행), 24px (헤더·버튼)
색상: color-text-secondary (#5f6368), 활성 시 color-primary
```

주요 아이콘 목록:

| 용도 | 아이콘 이름 |
|------|------------|
| 할 일 추가 | `add` |
| 수정 | `edit` |
| 삭제 | `delete` |
| 완료 체크 | `check_circle` |
| 카테고리 | `label` |
| 프로필 | `account_circle` |
| 로그아웃 | `logout` |
| 더보기 메뉴 | `more_vert` |
| 달력 | `calendar_today` |
| 검색 | `search` |
| 필터 | `filter_list` |
| 햄버거 메뉴 | `menu` |
| 다크 모드 | `dark_mode` |
| 라이트 모드 | `light_mode` |

---

## 6. 그림자 (Elevation)

| 레벨 | 값 | 적용 대상 |
|------|-----|---------|
| 0 | `none` | 기본 배경 요소 |
| 1 | `0 1px 3px rgba(0,0,0,0.08)` | 헤더 |
| 2 | `0 2px 6px rgba(0,0,0,0.12)` | FAB, 드롭다운 |
| 3 | `0 4px 24px rgba(0,0,0,0.15)` | 모달 |

---

## 7. 애니메이션

| 용도 | 속성 |
|------|------|
| 버튼 hover | `transition: background 0.15s ease` |
| 사이드바 항목 | `transition: background 0.15s ease` |
| 모달 등장 | `opacity 0→1, scale 0.95→1, duration: 150ms` |
| 리스트 행 추가/삭제 | `height + opacity, duration: 200ms` |
| 체크박스 완료 | `fill animation, duration: 150ms` |

---

## 8. 페이지별 레이아웃 가이드

### 8.1 로그인 / 회원가입 페이지

사이드바 없음. 중앙 정렬 카드 형태.

```
카드 너비: 400px (모바일 100%)
카드 padding: 40px
border-radius: 8px
box-shadow: elevation-3
```

### 8.2 할 일 목록 페이지 (메인)

```
Header
└─ [로고] [검색 입력] [프로필 아이콘]

Sidebar
└─ [카테고리 목록]
└─ [상태 필터]

Main Content
└─ [상태 탭] (전체 / 시작 전 / 진행 중 / 완료 / 기한 초과)
└─ [할 일 리스트]
└─ [FAB: 할 일 추가] (모바일)
```

### 8.3 내 정보 수정 페이지

사이드바 유지. 메인 영역에 폼 카드.

```
카드 max-width: 600px
카드 padding: 32px
border-radius: 8px
box-shadow: elevation-1
```
