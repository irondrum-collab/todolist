require('dotenv').config();
const pool = require('../../db/pool');
const { createDefaultCategory } = require('../../repositories/categoryRepository');

const TEST_EMAIL = `test_catrepo_${Date.now()}@example.com`;
let testUserId;

beforeAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE 'test_catrepo_%'`);
  const result = await pool.query(
    "INSERT INTO users(email, password, name) VALUES($1, $2, $3) RETURNING id",
    [TEST_EMAIL, 'hashed_pw', '카테고리테스트유저']
  );
  testUserId = result.rows[0].id;
});

afterAll(async () => {
  await pool.query(`DELETE FROM users WHERE email LIKE 'test_catrepo_%'`);
  await pool.end();
});

describe('categoryRepository', () => {
  test("createDefaultCategory로 '기본' 카테고리 생성 성공", async () => {
    const result = await createDefaultCategory(testUserId);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });
});
