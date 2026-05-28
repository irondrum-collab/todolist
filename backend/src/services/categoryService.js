const categoryRepository = require('../repositories/categoryRepository');

const getList = async (userId) => {
  return categoryRepository.findAllByUser(userId);
};

const create = async (userId, name) => {
  return categoryRepository.create(userId, name);
};

const update = async (userId, categoryId, name) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    const err = new Error('카테고리를 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  if (category.userId !== userId) {
    const err = new Error('수정 권한이 없습니다.');
    err.status = 403;
    throw err;
  }
  if (category.name === '기본') {
    const err = new Error("'기본' 카테고리는 수정할 수 없습니다.");
    err.status = 400;
    throw err;
  }
  return categoryRepository.update(categoryId, name);
};

const remove = async (userId, categoryId) => {
  const category = await categoryRepository.findById(categoryId);
  if (!category) {
    const err = new Error('카테고리를 찾을 수 없습니다.');
    err.status = 404;
    throw err;
  }
  if (category.userId !== userId) {
    const err = new Error('삭제 권한이 없습니다.');
    err.status = 403;
    throw err;
  }
  if (category.name === '기본') {
    const err = new Error("'기본' 카테고리는 삭제할 수 없습니다.");
    err.status = 400;
    throw err;
  }
  await categoryRepository.remove(categoryId);
};

module.exports = { getList, create, update, remove };
