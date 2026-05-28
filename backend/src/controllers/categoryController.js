const categoryService = require('../services/categoryService');

const getList = async (req, res, next) => {
  try {
    const categories = await categoryService.getList(req.user.id);
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 30) {
      const err = new Error('카테고리 이름은 1~30자이어야 합니다.');
      err.status = 400;
      return next(err);
    }
    const category = await categoryService.create(req.user.id, name.trim());
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 30) {
      const err = new Error('카테고리 이름은 1~30자이어야 합니다.');
      err.status = 400;
      return next(err);
    }
    const category = await categoryService.update(req.user.id, Number(req.params.id), name.trim());
    res.json({ category });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await categoryService.remove(req.user.id, Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { getList, create, update, remove };
