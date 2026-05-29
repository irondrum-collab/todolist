require('dotenv').config();

jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/categoryRepository');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const userRepository = require('../../repositories/userRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { login } = require('../../services/authService');

const MOCK_USER = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  name: '홍길동',
  theme: 'light',
  language: 'ko',
};

const ERROR_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.';

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test_secret';
  process.env.JWT_EXPIRES_IN = '7d';
});

describe('authService.login', () => {
  test('정상 로그인: token과 user 반환', async () => {
    userRepository.findByEmail.mockResolvedValue(MOCK_USER);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock_token');

    const result = await login('test@example.com', 'Password1!');

    expect(result).toEqual({
      token: 'mock_token',
      user: { id: 1, email: 'test@example.com', name: '홍길동', theme: 'light', language: 'ko' },
    });
  });

  test('이메일 없음: findByEmail=null → status 401 에러 throw', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.compare.mockResolvedValue(false);

    await expect(login('none@example.com', 'Password1!')).rejects.toMatchObject({
      message: ERROR_MESSAGE,
      status: 401,
    });
  });

  test('비밀번호 불일치: bcrypt.compare=false → status 401 에러 throw (동일 메시지)', async () => {
    userRepository.findByEmail.mockResolvedValue(MOCK_USER);
    bcrypt.compare.mockResolvedValue(false);

    await expect(login('test@example.com', 'WrongPassword1!')).rejects.toMatchObject({
      message: ERROR_MESSAGE,
      status: 401,
    });
  });

  test('JWT payload에 id, email 포함 확인', async () => {
    userRepository.findByEmail.mockResolvedValue(MOCK_USER);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock_token');

    await login('test@example.com', 'Password1!');

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: MOCK_USER.id, email: MOCK_USER.email },
      'test_secret',
      expect.objectContaining({ expiresIn: '7d' })
    );
  });

  test('JWT_EXPIRES_IN 환경변수가 expiresIn으로 전달됨', async () => {
    process.env.JWT_EXPIRES_IN = '1h';
    userRepository.findByEmail.mockResolvedValue(MOCK_USER);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock_token');

    await login('test@example.com', 'Password1!');

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      { expiresIn: '1h' }
    );
  });
});
