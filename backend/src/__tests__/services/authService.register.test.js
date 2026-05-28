jest.mock('../../repositories/userRepository');
jest.mock('../../repositories/categoryRepository');
jest.mock('bcrypt');

const userRepository = require('../../repositories/userRepository');
const categoryRepository = require('../../repositories/categoryRepository');
const bcrypt = require('bcrypt');
const { register } = require('../../services/authService');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.BCRYPT_SALT_ROUNDS = '10';
});

describe('authService.register', () => {
  test('정상 register: bcrypt.hash, createUser, createDefaultCategory 모두 호출', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed_password');
    userRepository.createUser.mockResolvedValue({ id: 1, email: 'test@example.com', name: '홍길동' });
    categoryRepository.createDefaultCategory.mockResolvedValue({ id: 1 });

    await register('test@example.com', 'Password1!', '홍길동');

    expect(bcrypt.hash).toHaveBeenCalledWith('Password1!', 10);
    expect(userRepository.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'hashed_password',
      name: '홍길동',
    });
    expect(categoryRepository.createDefaultCategory).toHaveBeenCalledWith(1);
  });

  test('이메일 중복: findByEmail이 사용자 반환 시 status=409 에러 throw', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 1, email: 'dup@example.com' });

    await expect(register('dup@example.com', 'Password1!', '홍길동')).rejects.toMatchObject({
      message: '이미 사용 중인 이메일입니다.',
      status: 409,
    });

    expect(userRepository.createUser).not.toHaveBeenCalled();
    expect(categoryRepository.createDefaultCategory).not.toHaveBeenCalled();
  });

  test('bcrypt salt rounds가 환경변수에서 읽힘', async () => {
    process.env.BCRYPT_SALT_ROUNDS = '12';
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    userRepository.createUser.mockResolvedValue({ id: 2, email: 'test2@example.com', name: '김철수' });
    categoryRepository.createDefaultCategory.mockResolvedValue({ id: 2 });

    await register('test2@example.com', 'Password1!', '김철수');

    expect(bcrypt.hash).toHaveBeenCalledWith('Password1!', 12);
  });
});
