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

const findAllByUser = async (userId) => {
  const result = await pool.query(
    'SELECT id, name, user_id AS "userId" FROM categories WHERE user_id=$1 ORDER BY id ASC',
    [userId]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, user_id AS "userId" FROM categories WHERE id=$1',
    [id]
  );
  return result.rows[0] || null;
};

const create = async (userId, name) => {
  const result = await pool.query(
    'INSERT INTO categories(name, user_id) VALUES($1, $2) RETURNING id, name, user_id AS "userId"',
    [name, userId]
  );
  return result.rows[0];
};

const update = async (id, name) => {
  const result = await pool.query(
    'UPDATE categories SET name=$1 WHERE id=$2 RETURNING id, name, user_id AS "userId"',
    [name, id]
  );
  return result.rows[0];
};

const remove = async (id) => {
  await pool.query('DELETE FROM categories WHERE id=$1', [id]);
};

module.exports = { createDefaultCategory, findDefaultByUser, findAllByUser, findById, create, update, remove };
