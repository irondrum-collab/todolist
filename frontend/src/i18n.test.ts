import { describe, test, expect, beforeEach } from 'vitest';
import i18n from './i18n';

describe('i18n 초기화 및 번역', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  test('기본 언어는 ko', () => {
    expect(i18n.language).toBe('ko');
  });

  test('한국어 번역 — auth 네임스페이스', () => {
    expect(i18n.t('auth.login_title')).toBe('로그인');
    expect(i18n.t('auth.register_title')).toBe('회원가입');
    expect(i18n.t('auth.email')).toBe('이메일');
    expect(i18n.t('auth.password')).toBe('비밀번호');
  });

  test('한국어 번역 — common 네임스페이스', () => {
    expect(i18n.t('common.save')).toBe('저장');
    expect(i18n.t('common.cancel')).toBe('취소');
    expect(i18n.t('common.delete')).toBe('삭제');
    expect(i18n.t('common.logout')).toBe('로그아웃');
  });

  test('한국어 번역 — todo 네임스페이스', () => {
    expect(i18n.t('todo.empty')).toBe('등록된 할 일이 없습니다');
    expect(i18n.t('todo.new_title')).toBe('새 할 일 등록');
    expect(i18n.t('todo.edit_title')).toBe('할 일 수정');
    expect(i18n.t('todo.date_error')).toBe('종료일자는 시작일자 이후여야 합니다');
  });

  test('한국어 번역 — status 네임스페이스', () => {
    expect(i18n.t('status.not_started')).toBe('시작 전');
    expect(i18n.t('status.in_progress')).toBe('진행 중');
    expect(i18n.t('status.completed')).toBe('완료');
    expect(i18n.t('status.overdue')).toBe('기한 초과');
    expect(i18n.t('status.no_date')).toBe('진행 중 (날짜 없음)');
  });

  test('한국어 번역 — filter 네임스페이스', () => {
    expect(i18n.t('filter.title')).toBe('필터');
    expect(i18n.t('filter.all')).toBe('전체');
  });

  test('한국어 번역 — category 네임스페이스', () => {
    expect(i18n.t('category.title')).toBe('카테고리 관리');
    expect(i18n.t('category.add_btn')).toBe('추가');
  });

  test('한국어 번역 — profile 네임스페이스', () => {
    expect(i18n.t('profile.title')).toBe('내 정보 수정');
    expect(i18n.t('profile.name_saved')).toBe('이름이 저장되었습니다.');
    expect(i18n.t('profile.password_mismatch')).toBe('새 비밀번호가 일치하지 않습니다');
  });

  test('영어로 전환 시 영어 텍스트 반환', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('auth.login_title')).toBe('Login');
    expect(i18n.t('auth.register_title')).toBe('Sign Up');
    expect(i18n.t('common.save')).toBe('Save');
    expect(i18n.t('common.logout')).toBe('Logout');
    expect(i18n.t('todo.empty')).toBe('No todos found');
    expect(i18n.t('status.not_started')).toBe('Not Started');
    expect(i18n.t('status.in_progress')).toBe('In Progress');
    expect(i18n.t('profile.title')).toBe('Edit Profile');
  });

  test('보간(interpolation) 동작 확인 — todo.list_count', () => {
    expect(i18n.t('todo.list_count', { count: 5 })).toBe('할 일 목록 (5건)');
  });

  test('보간(interpolation) — en todo.list_count', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('todo.list_count', { count: 3 })).toBe('Todo List (3)');
  });

  test('지원하지 않는 언어 코드 → fallbackLng ko 적용', async () => {
    await i18n.changeLanguage('fr');
    expect(i18n.t('auth.login_title')).toBe('로그인');
    expect(i18n.t('common.save')).toBe('저장');
  });

  test('지원하지 않는 언어 코드 ja → fallbackLng ko 적용', async () => {
    await i18n.changeLanguage('ja');
    expect(i18n.t('todo.empty')).toBe('등록된 할 일이 없습니다');
  });

  test('한→영→한 언어 전환 연속 동작', async () => {
    expect(i18n.t('auth.login_title')).toBe('로그인');
    await i18n.changeLanguage('en');
    expect(i18n.t('auth.login_title')).toBe('Login');
    await i18n.changeLanguage('ko');
    expect(i18n.t('auth.login_title')).toBe('로그인');
  });
});
