const pool = require('../db/pool');

const create = async ({ title, description, startDate, endDate, categoryId, userId }) => {
  const result = await pool.query(
    `INSERT INTO todos(title, description, start_date, end_date, category_id, user_id)
     VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [
      title,
      description !== undefined ? description : null,
      startDate !== undefined ? startDate : null,
      endDate !== undefined ? endDate : null,
      categoryId,
      userId,
    ]
  );
  return result.rows[0];
};

const findAllByUser = async (userId, { categoryId } = {}) => {
  const params = [userId];
  let query = 'SELECT * FROM todos WHERE user_id=$1';

  if (categoryId) {
    params.push(categoryId);
    query += ` AND category_id=$${params.length}`;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query('SELECT * FROM todos WHERE id=$1', [id]);
  return result.rows[0] || null;
};

const update = async (id, fields) => {
  const columnMap = {
    title: 'title',
    description: 'description',
    startDate: 'start_date',
    endDate: 'end_date',
    isCompleted: 'is_completed',
    categoryId: 'category_id',
  };

  const setClauses = [];
  const params = [];

  for (const [key, column] of Object.entries(columnMap)) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      params.push(fields[key]);
      setClauses.push(`${column}=$${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return findById(id);
  }

  params.push(id);
  const query = `UPDATE todos SET ${setClauses.join(', ')} WHERE id=$${params.length} RETURNING *`;
  const result = await pool.query(query, params);
  return result.rows[0];
};

const remove = async (id) => {
  await pool.query('DELETE FROM todos WHERE id=$1', [id]);
};

module.exports = { create, findAllByUser, findById, update, remove };
