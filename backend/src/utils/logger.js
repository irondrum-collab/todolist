const log = (level, message) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [${level}] ${message}`);
};

const logger = {
  info: (msg) => log('INFO', msg),
  warn: (msg) => log('WARN', msg),
  error: (msg) => log('ERROR', msg),
};

module.exports = logger;
