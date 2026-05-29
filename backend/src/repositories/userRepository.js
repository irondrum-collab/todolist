const pool = require('../db/pool');

const findByEmail = async (email) => {
  const result = await pool.query(
    'SELECT id, email, password, name, theme, language FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

const createUser = async ({ email, password, name }) => {
  const result = await pool.query(
    'INSERT INTO users(email, password, name) VALUES($1, $2, $3) RETURNING id, email, name, created_at',
    [email, password, name]
  );
  return result.rows[0];
};

const findById = async (id) => {
  const result = await pool.query(
    'SELECT id, email, name, theme, language, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

const findByIdWithPassword = async (id) => {
  const result = await pool.query(
    'SELECT id, email, password, name FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

const updateUser = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findById(id);
  }

  const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);
  const values = keys.map((key) => fields[key]);
  values.push(id);

  const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING id, email, name, theme, language, created_at`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

module.exports = { findByEmail, createUser, findById, findByIdWithPassword, updateUser };
