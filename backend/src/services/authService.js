const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const categoryRepository = require('../repositories/categoryRepository');

const register = async (email, password, name) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('이미 사용 중인 이메일입니다.');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
  const user = await userRepository.createUser({ email, password: hashed, name });
  await categoryRepository.createDefaultCategory(user.id);
};

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  const isMatch = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || !isMatch) {
    const err = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return { token, user: { id: user.id, email: user.email, name: user.name } };
};

module.exports = { register, login };
