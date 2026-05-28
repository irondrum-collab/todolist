const { calcStatus } = require('../../utils/todoStatus');

describe('calcStatus', () => {
  test('is_completed=true → 완료', () => {
    expect(calcStatus(true, null, null)).toBe('완료');
    expect(calcStatus(true, '2024-01-01', '2024-12-31')).toBe('완료');
  });

  test('is_completed=false, startDate/endDate 모두 null → 진행 중 (날짜 없음)', () => {
    expect(calcStatus(false, null, null)).toBe('진행 중 (날짜 없음)');
  });

  test('오늘 < startDate → 시작 전', () => {
    const futureDate = '9999-12-31';
    expect(calcStatus(false, futureDate, null)).toBe('시작 전');
    expect(calcStatus(false, futureDate, '9999-12-31')).toBe('시작 전');
  });

  test('startDate <= 오늘 <= endDate → 진행 중', () => {
    const pastDate = '2000-01-01';
    const futureDate = '9999-12-31';
    expect(calcStatus(false, pastDate, futureDate)).toBe('진행 중');
  });

  test('오늘 > endDate → 기한 초과', () => {
    const pastDate = '2000-01-01';
    expect(calcStatus(false, null, pastDate)).toBe('기한 초과');
    expect(calcStatus(false, '1999-01-01', pastDate)).toBe('기한 초과');
  });
});
