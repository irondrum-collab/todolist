const todoRepository = require('../repositories/todoRepository');
const categoryRepository = require('../repositories/categoryRepository');
const { calcStatus } = require('../utils/todoStatus');

const toTodo = (row) => {
  const startDate = row.start_date || null;
  const endDate = row.end_date || null;
  return {
    id: row.id,
    title: row.title,
    description: row.description || null,
    startDate,
    endDate,
    isCompleted: row.is_completed,
    status: calcStatus(row.is_completed, startDate, endDate),
    categoryId: row.category_id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const create = async (userId, { title, description, categoryId, startDate, endDate }) => {
  let resolvedCategoryId = categoryId;

  if (!resolvedCategoryId) {
    const defaultCategory = await categoryRepository.findDefaultByUser(userId);
    if (defaultCategory) {
      resolvedCategoryId = defaultCategory.id;
    }
  }

  const row = await todoRepository.create({
    title,
    description,
    startDate,
    endDate,
    categoryId: resolvedCategoryId,
    userId,
  });

  return toTodo(row);
};

const getList = async (userId, { categoryId, status } = {}) => {
  const rows = await todoRepository.findAllByUser(userId, { categoryId });
  let todos = rows.map(toTodo);

  if (status) {
    todos = todos.filter((t) => t.status === status);
  }

  return todos;
};

const update = async (userId, todoId, fields) => {
  const existing = await todoRepository.findById(todoId);

  if (!existing) {
    const err = new Error('할 일을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }

  if (existing.user_id !== userId) {
    const err = new Error('다른 사용자의 할 일을 수정할 수 없습니다.');
    err.status = 403;
    throw err;
  }

  const resolvedStartDate = fields.startDate !== undefined ? fields.startDate : (existing.start_date || null);
  const resolvedEndDate = fields.endDate !== undefined ? fields.endDate : (existing.end_date || null);

  if (resolvedStartDate && resolvedEndDate && resolvedEndDate < resolvedStartDate) {
    const err = new Error('종료일자는 시작일자보다 같거나 이후여야 합니다.');
    err.status = 400;
    throw err;
  }

  const row = await todoRepository.update(todoId, fields);
  return toTodo(row);
};

const remove = async (userId, todoId) => {
  const existing = await todoRepository.findById(todoId);

  if (!existing) {
    const err = new Error('할 일을 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }

  if (existing.user_id !== userId) {
    const err = new Error('다른 사용자의 할 일을 삭제할 수 없습니다.');
    err.status = 403;
    throw err;
  }

  await todoRepository.remove(todoId);
};

module.exports = { create, getList, update, remove };
