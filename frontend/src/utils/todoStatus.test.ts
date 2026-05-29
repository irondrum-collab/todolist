import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calcTodoStatus } from './todoStatus';

const today = '2026-05-28';
const yesterday = '2026-05-27';
const tomorrow = '2026-05-29';
const pastDate = '2026-05-10';
const futureDate = '2026-06-10';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${today}T00:00:00`));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('calcTodoStatus', () => {
  it('isCompleted=true이면 날짜에 관계없이 완료 반환', () => {
    expect(calcTodoStatus({ isCompleted: true, startDate: null, endDate: null })).toBe('완료');
    expect(calcTodoStatus({ isCompleted: true, startDate: pastDate, endDate: yesterday })).toBe('완료');
    expect(calcTodoStatus({ isCompleted: true, startDate: tomorrow, endDate: futureDate })).toBe('완료');
  });

  it('isCompleted=false, startDate/endDate 모두 null이면 진행 중 (날짜 없음) 반환', () => {
    expect(calcTodoStatus({ isCompleted: false, startDate: null, endDate: null })).toBe('진행 중 (날짜 없음)');
  });

  it('isCompleted=false, 오늘 < startDate이면 시작 전 반환', () => {
    expect(calcTodoStatus({ isCompleted: false, startDate: tomorrow, endDate: futureDate })).toBe('시작 전');
    expect(calcTodoStatus({ isCompleted: false, startDate: futureDate, endDate: null })).toBe('시작 전');
  });

  it('isCompleted=false, startDate <= 오늘 <= endDate이면 진행 중 반환', () => {
    expect(calcTodoStatus({ isCompleted: false, startDate: today, endDate: tomorrow })).toBe('진행 중');
    expect(calcTodoStatus({ isCompleted: false, startDate: yesterday, endDate: today })).toBe('진행 중');
    expect(calcTodoStatus({ isCompleted: false, startDate: yesterday, endDate: tomorrow })).toBe('진행 중');
  });

  it('isCompleted=false, 오늘 > endDate이면 기한 초과 반환', () => {
    expect(calcTodoStatus({ isCompleted: false, startDate: pastDate, endDate: yesterday })).toBe('기한 초과');
    expect(calcTodoStatus({ isCompleted: false, startDate: null, endDate: yesterday })).toBe('기한 초과');
  });

  it('startDate만 있고 오늘이 startDate 이후면 진행 중 반환', () => {
    expect(calcTodoStatus({ isCompleted: false, startDate: yesterday, endDate: null })).toBe('진행 중');
    expect(calcTodoStatus({ isCompleted: false, startDate: today, endDate: null })).toBe('진행 중');
  });
});
