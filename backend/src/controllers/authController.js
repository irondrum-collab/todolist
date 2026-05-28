const { requireFields, isValidEmail, isValidPassword } = require('../utils/validate');
const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const missing = requireFields(req.body, ['email', 'password', 'name']);
    if (missing.length > 0) {
      const err = new Error(`필수 항목이 누락되었습니다: ${missing.join(', ')}`);
      err.status = 400;
      return next(err);
    }

    if (!isValidEmail(email)) {
      const err = new Error('유효하지 않은 이메일 형식입니다.');
      err.status = 400;
      return next(err);
    }

    if (!isValidPassword(password)) {
      const err = new Error('비밀번호는 8~128자이며 영문, 숫자, 특수문자를 각 1자 이상 포함해야 합니다.');
      err.status = 400;
      return next(err);
    }

    if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
      const err = new Error('이름은 1~50자이어야 합니다.');
      err.status = 400;
      return next(err);
    }

    await authService.register(email, password, name.trim());
    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const missing = requireFields(req.body, ['email', 'password']);
    if (missing.length > 0) {
      const err = new Error(`필수 항목이 누락되었습니다: ${missing.join(', ')}`);
      err.status = 400;
      return next(err);
    }

    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
