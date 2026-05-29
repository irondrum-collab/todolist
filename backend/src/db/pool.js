const { Pool, types } = require('pg');

// pg는 DATE 타입(OID 1082)을 Date 객체로 변환한다.
// JSON 직렬화 시 UTC 기준으로 변환되어 한국(UTC+9) 환경에서 -1일 오류가 발생한다.
// 문자열 그대로 반환하도록 파서를 재정의한다.
types.setTypeParser(1082, (val) => val);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

module.exports = pool;
