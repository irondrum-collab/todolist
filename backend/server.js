require('dotenv').config();

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'BCRYPT_SALT_ROUNDS',
  'CORS_ORIGIN',
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[서버 시작 실패] 필수 환경변수 누락: ${missing.join(', ')}`);
  process.exit(1);
}

const app = require('./src/app');
const pool = require('./src/db/pool');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

async function start() {
  await pool.query('SELECT NOW()');
  logger.info('DB 연결 성공');

  app.listen(PORT, () => {
    logger.info(`서버 시작: http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  logger.error(`서버 시작 실패: ${err.message}`);
  process.exit(1);
});
