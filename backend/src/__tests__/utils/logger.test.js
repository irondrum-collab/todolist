const logger = require('../../utils/logger');

describe('logger', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('info 레벨 로그 출력', () => {
    logger.info('테스트 메시지');
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.mock.calls[0][0]).toMatch(/\[INFO\] 테스트 메시지/);
  });

  test('warn 레벨 로그 출력', () => {
    logger.warn('경고 메시지');
    expect(consoleSpy.mock.calls[0][0]).toMatch(/\[WARN\] 경고 메시지/);
  });

  test('error 레벨 로그 출력', () => {
    logger.error('오류 메시지');
    expect(consoleSpy.mock.calls[0][0]).toMatch(/\[ERROR\] 오류 메시지/);
  });

  test('ISO 타임스탬프 포함', () => {
    logger.info('ts 확인');
    const output = consoleSpy.mock.calls[0][0];
    expect(output).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
  });
});
