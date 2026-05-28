const todoService = require('../services/todoService');
const { requireFields } = require('../utils/validate');

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const create = async (req, res, next) => {
  try {
    const body = req.body;
    const missing = requireFields(body, ['title']);
    if (missing.length > 0) {
      const err = new Error('title은 필수 항목입니다.');
      err.status = 400;
      return next(err);
    }

    if (typeof body.title !== 'string' || body.title.length < 1 || body.title.length > 100) {
      const err = new Error('title은 1~100자여야 합니다.');
      err.status = 400;
      return next(err);
    }

    if (body.description !== undefined && body.description !== null && body.description.length > 1000) {
      const err = new Error('description은 최대 1000자여야 합니다.');
      err.status = 400;
      return next(err);
    }

    if (body.startDate !== undefined && body.startDate !== null && !DATE_REGEX.test(body.startDate)) {
      const err = new Error('startDate 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      err.status = 400;
      return next(err);
    }

    if (body.endDate !== undefined && body.endDate !== null && !DATE_REGEX.test(body.endDate)) {
      const err = new Error('endDate 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      err.status = 400;
      return next(err);
    }

    if (body.startDate && body.endDate && body.endDate < body.startDate) {
      const err = new Error('종료일자는 시작일자보다 같거나 이후여야 합니다.');
      err.status = 400;
      return next(err);
    }

    const todo = await todoService.create(req.user.id, body);
    return res.status(201).json({ todo });
  } catch (err) {
    return next(err);
  }
};

const getList = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const { status } = req.query;

    const todos = await todoService.getList(req.user.id, { categoryId, status });
    return res.status(200).json({ todos });
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const body = req.body;

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.length < 1 || body.title.length > 100) {
        const err = new Error('title은 1~100자여야 합니다.');
        err.status = 400;
        return next(err);
      }
    }

    if (body.startDate !== undefined && body.startDate !== null && !DATE_REGEX.test(body.startDate)) {
      const err = new Error('startDate 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      err.status = 400;
      return next(err);
    }

    if (body.endDate !== undefined && body.endDate !== null && !DATE_REGEX.test(body.endDate)) {
      const err = new Error('endDate 형식이 올바르지 않습니다. (YYYY-MM-DD)');
      err.status = 400;
      return next(err);
    }

    const todo = await todoService.update(req.user.id, todoId, body);
    return res.status(200).json({ todo });
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const todoId = Number(req.params.id);
    await todoService.remove(req.user.id, todoId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, getList, update, remove };
