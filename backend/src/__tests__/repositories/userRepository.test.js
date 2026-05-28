require('dotenv').config();
const pool = require('../../db/pool');
const { findByEmail, createUser } = require('../../repositories/userRepository');

const TEST_EMAIL_PREFIX = 'test_userrepo_';

beforeAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '${TEST_EMAIL_PREFIX}%'`);
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE '${TEST_EMAIL_PREFIX}%'`);
  await pool.end();
});

describe('userRepository', () => {
  test('createUser로 사용자 생성 후 findByEmail로 조회 성공', async () => {
    const email = `${TEST_EMAIL_PREFIX}${Date.now()}@example.com`;
    const created = await createUser({ email, password: 'hashed_pw', name: '테스트유저' });

    expect(created).toMatchObject({ email, name: '테스트유저' });
    expect(created.id).toBeDefined();
    expect(created.created_at).toBeDefined();

    const found = await findByEmail(email);
    expect(found).toMatchObject({ email, name: '테스트유저' });
    expect(found.password).toBe('hashed_pw');
  });

  test('존재하지 않는 이메일 조회 시 null 반환', async () => {
    const result = await findByEmail('nonexistent_zzzz@example.com');
    expect(result === null || result === undefined).toBe(true);
  });

  test('동일 이메일 중복 생성 시 DB 에러 발생', async () => {
    const email = `${TEST_EMAIL_PREFIX}dup_${Date.now()}@example.com`;
    await createUser({ email, password: 'hashed_pw', name: '중복유저' });
    await expect(
      createUser({ email, password: 'hashed_pw2', name: '중복유저2' })
    ).rejects.toThrow();
  });
});
