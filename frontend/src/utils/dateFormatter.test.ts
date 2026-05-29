import { describe, it, expect } from 'vitest';
import { formatDate, formatDateRange } from './dateFormatter';

describe('formatDate', () => {
  it('YYYY-MM-DD 형식 날짜를 그대로 반환', () => {
    expect(formatDate('2026-05-28')).toBe('2026-05-28');
    expect(formatDate('2026-01-01')).toBe('2026-01-01');
  });

  it('null이면 날짜 미지정 반환', () => {
    expect(formatDate(null)).toBe('날짜 미지정');
  });
});

describe('formatDateRange', () => {
  it('startDate, endDate 모두 있으면 범위 문자열 반환', () => {
    expect(formatDateRange('2026-05-01', '2026-05-31')).toBe('2026-05-01 ~ 2026-05-31');
  });

  it('startDate만 있으면 시작일 ~ 형태 반환', () => {
    expect(formatDateRange('2026-05-01', null)).toBe('2026-05-01 ~');
  });

  it('endDate만 있으면 ~ 종료일 형태 반환', () => {
    expect(formatDateRange(null, '2026-05-31')).toBe('~ 2026-05-31');
  });

  it('둘 다 null이면 날짜 미지정 반환', () => {
    expect(formatDateRange(null, null)).toBe('날짜 미지정');
  });
});
