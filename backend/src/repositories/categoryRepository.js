const pool = require('../db/pool');

const createDefaultCategory = async (userId) => {
  const result = await pool.query(
    "INSERT INTO categories(name, user_id) VALUES('기본', $1) RETURNING id",
    [userId]
  );
  return result.rows[0];
};

const findDefaultByUser = async (userId) => {
  const result = await pool.query(
    "SELECT id FROM categories WHERE user_id=$1 AND name='기본' LIMIT 1",
    [userId]
  );
  return result.rows[0] || null;
};

module.exports = { createDefaultCategory, findDefaultByUser };
