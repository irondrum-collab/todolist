const logger = require('../utils/logger');

const STATUS_CODES = new Set([400, 401, 403, 404, 409]);

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  const status = STATUS_CODES.has(err.status) ? err.status : 500;

  if (status === 500) {
    logger.error(`${req.method} ${req.path} — ${err.message}`);
  }

  res.status(status).json({ message: err.message || '서버 내부 오류가 발생했습니다.' });
};

module.exports = errorMiddleware;
