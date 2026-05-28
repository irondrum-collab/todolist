require('dotenv').config();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middlewares/authMiddleware');

const makeReqRes = (authHeader) => {
  const req = { headers: { authorization: authHeader } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();
  return { req, res, next };
};

describe('authMiddleware', () => {
  const secret = process.env.JWT_SECRET || 'test_secret';
  const payload = { id: 1, email: 'user@example.com' };

  test('유효한 토큰 — req.user 주입 후 next() 호출', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: 1, email: 'user@example.com' });
  });

  test('Authorization 헤더 없음 — 401 반환', () => {
    const { req, res, next } = makeReqRes(undefined);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: '인증 토큰이 필요합니다.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Bearer 접두사 없음 — 401 반환', () => {
    const token = jwt.sign(payload, secret);
    const { req, res, next } = makeReqRes(token);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('잘못된 토큰 — 401 반환', () => {
    const { req, res, next } = makeReqRes('Bearer invalid.token.here');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: '유효하지 않은 토큰입니다.' });
  });

  test('만료된 토큰 — 401 반환', () => {
    const token = jwt.sign(payload, secret, { expiresIn: '0s' });
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: '토큰이 만료되었습니다.' });
  });

  test('다른 시크릿으로 서명된 토큰 — 401 반환', () => {
    const token = jwt.sign(payload, 'wrong_secret');
    const { req, res, next } = makeReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: '유효하지 않은 토큰입니다.' });
  });
});
