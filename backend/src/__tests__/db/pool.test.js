require('dotenv').config();
const pool = require('../../db/pool');

describe('pool', () => {
  afterAll(() => pool.end());

  test('SELECT NOW() 쿼리 성공', async () => {
    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].now).toBeInstanceOf(Date);
  });

  test('잘못된 쿼리 시 에러 발생', async () => {
    await expect(pool.query('SELECT * FROM 존재하지않는테이블')).rejects.toThrow();
  });
});
