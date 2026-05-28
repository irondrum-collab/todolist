const { isValidEmail, isValidPassword, requireFields } = require('../../utils/validate');

describe('isValidEmail', () => {
  test.each([
    ['user@example.com', true],
    ['user+tag@sub.domain.co.kr', true],
    ['a@b.io', true],
  ])('유효한 이메일 "%s" → true', (email, expected) => {
    expect(isValidEmail(email)).toBe(expected);
  });

  test.each([
    ['notanemail', false],
    ['missing@', false],
    ['@nodomain.com', false],
    ['spaces @example.com', false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('유효하지 않은 이메일 "%s" → false', (email, expected) => {
    expect(isValidEmail(email)).toBe(expected);
  });

  test('254자 초과 이메일 → false', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    expect(isValidEmail(longEmail)).toBe(false);
  });

  test('정확히 254자 이메일 → true', () => {
    const local = 'a'.repeat(248);
    const email = `${local}@b.com`;
    expect(email.length).toBe(254);
    expect(isValidEmail(email)).toBe(true);
  });
});

describe('isValidPassword', () => {
  test.each([
    ['Password1!', true],
    ['Abcdefg1@', true],
    ['복잡한Pass1!', true],
  ])('유효한 비밀번호 "%s" → true', (pw, expected) => {
    expect(isValidPassword(pw)).toBe(expected);
  });

  test('7자 미만 → false', () => {
    expect(isValidPassword('Ab1!')).toBe(false);
  });

  test('정확히 8자 유효 → true', () => {
    expect(isValidPassword('Abcde1!')).toBe(false); // 7자
    expect(isValidPassword('Abcde12!')).toBe(true);  // 8자
  });

  test('129자 초과 → false', () => {
    const pw = 'A1!' + 'a'.repeat(126);
    expect(pw.length).toBe(129);
    expect(isValidPassword(pw)).toBe(false);
  });

  test('정확히 128자 유효 → true', () => {
    const pw = 'A1!' + 'a'.repeat(125);
    expect(pw.length).toBe(128);
    expect(isValidPassword(pw)).toBe(true);
  });

  test('영문 없음 → false', () => {
    expect(isValidPassword('12345678!')).toBe(false);
  });

  test('숫자 없음 → false', () => {
    expect(isValidPassword('Abcdefg!')).toBe(false);
  });

  test('특수문자 없음 → false', () => {
    expect(isValidPassword('Abcdefg1')).toBe(false);
  });

  test('null/undefined → false', () => {
    expect(isValidPassword(null)).toBe(false);
    expect(isValidPassword(undefined)).toBe(false);
  });
});

describe('requireFields', () => {
  test('모든 필드 존재 → 빈 배열', () => {
    const body = { email: 'a@b.com', password: 'pw', name: '홍길동' };
    expect(requireFields(body, ['email', 'password', 'name'])).toEqual([]);
  });

  test('일부 필드 누락 → 누락 필드명 반환', () => {
    const body = { email: 'a@b.com' };
    expect(requireFields(body, ['email', 'password', 'name'])).toEqual(['password', 'name']);
  });

  test('빈 문자열도 누락으로 처리', () => {
    const body = { email: '', password: 'pw', name: '홍길동' };
    expect(requireFields(body, ['email', 'password', 'name'])).toEqual(['email']);
  });

  test('null 값도 누락으로 처리', () => {
    const body = { email: null, password: 'pw', name: '홍길동' };
    expect(requireFields(body, ['email', 'password', 'name'])).toEqual(['email']);
  });

  test('필드 목록 빈 배열 → 빈 배열', () => {
    expect(requireFields({}, [])).toEqual([]);
  });
});
