jest.mock('../../repositories/userRepository');
jest.mock('bcrypt');

const userRepository = require('../../repositories/userRepository');
const bcrypt = require('bcrypt');
const { updateMe } = require('../../services/userService');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.BCRYPT_SALT_ROUNDS = '10';
});

describe('userService.updateMe', () => {
  const mockRow = {
    id: 1,
    email: 'user@example.com',
    name: '홍길동',
    theme: 'light',
    language: 'ko',
    created_at: '2026-05-28T00:00:00.000Z',
  };

  test('정상 이름만 변경: updateUser 호출, password 관련 함수 미호출', async () => {
    const updatedRow = { ...mockRow, name: '새이름' };
    userRepository.updateUser.mockResolvedValue(updatedRow);

    const result = await updateMe(1, { name: '새이름', currentPassword: undefined, newPassword: undefined });

    expect(userRepository.updateUser).toHaveBeenCalledWith(1, { name: '새이름' });
    expect(userRepository.findByIdWithPassword).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      id: 1,
      email: 'user@example.com',
      name: '새이름',
      theme: 'light',
      language: 'ko',
      createdAt: '2026-05-28T00:00:00.000Z',
    });
  });

  test('정상 비밀번호 변경: findByIdWithPassword → bcrypt.compare(true) → bcrypt.hash → updateUser', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashed_old', name: '홍길동' });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('hashed_new');
    userRepository.updateUser.mockResolvedValue(mockRow);

    const result = await updateMe(1, { name: undefined, currentPassword: 'OldPass1!', newPassword: 'NewPass1!' });

    expect(userRepository.findByIdWithPassword).toHaveBeenCalledWith(1);
    expect(bcrypt.compare).toHaveBeenCalledWith('OldPass1!', 'hashed_old');
    expect(bcrypt.hash).toHaveBeenCalledWith('NewPass1!', 10);
    expect(userRepository.updateUser).toHaveBeenCalledWith(1, { password: 'hashed_new' });
    expect(result.createdAt).toBe('2026-05-28T00:00:00.000Z');
  });

  test('currentPassword 없이 newPassword만 → status=400 에러', async () => {
    await expect(
      updateMe(1, { name: undefined, currentPassword: undefined, newPassword: 'NewPass1!' })
    ).rejects.toMatchObject({
      message: '비밀번호 변경 시 현재 비밀번호가 필요합니다.',
      status: 400,
    });

    expect(userRepository.findByIdWithPassword).not.toHaveBeenCalled();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  test('비밀번호 불일치 → status=401 에러', async () => {
    userRepository.findByIdWithPassword.mockResolvedValue({ id: 1, email: 'user@example.com', password: 'hashed_old', name: '홍길동' });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      updateMe(1, { name: undefined, currentPassword: 'WrongPass1!', newPassword: 'NewPass1!' })
    ).rejects.toMatchObject({
      message: '현재 비밀번호가 올바르지 않습니다.',
      status: 401,
    });

    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(userRepository.updateUser).not.toHaveBeenCalled();
  });

  test('아무것도 변경 안 함 (name/newPassword 모두 undefined): updateUser 호출 없이 findById 결과 반환', async () => {
    userRepository.findById.mockResolvedValue(mockRow);

    const result = await updateMe(1, { name: undefined, currentPassword: undefined, newPassword: undefined });

    expect(userRepository.findById).toHaveBeenCalledWith(1);
    expect(userRepository.updateUser).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      id: 1,
      email: 'user@example.com',
      name: '홍길동',
      createdAt: '2026-05-28T00:00:00.000Z',
    });
  });

  test('theme만 변경: updateUser({ theme: "dark" }) 호출', async () => {
    const updatedRow = { ...mockRow, theme: 'dark' };
    userRepository.updateUser.mockResolvedValue(updatedRow);

    const result = await updateMe(1, { theme: 'dark' });

    expect(userRepository.updateUser).toHaveBeenCalledWith(1, { theme: 'dark' });
    expect(result).toMatchObject({ theme: 'dark', language: 'ko' });
  });

  test('language만 변경: updateUser({ language: "en" }) 호출', async () => {
    const updatedRow = { ...mockRow, language: 'en' };
    userRepository.updateUser.mockResolvedValue(updatedRow);

    const result = await updateMe(1, { language: 'en' });

    expect(userRepository.updateUser).toHaveBeenCalledWith(1, { language: 'en' });
    expect(result).toMatchObject({ theme: 'light', language: 'en' });
  });

  test('theme과 name 동시 변경: fields에 둘 다 포함', async () => {
    const updatedRow = { ...mockRow, name: '새이름', theme: 'dark' };
    userRepository.updateUser.mockResolvedValue(updatedRow);

    const result = await updateMe(1, { name: '새이름', theme: 'dark' });

    expect(userRepository.updateUser).toHaveBeenCalledWith(1, { name: '새이름', theme: 'dark' });
    expect(result).toMatchObject({ name: '새이름', theme: 'dark' });
  });
});
