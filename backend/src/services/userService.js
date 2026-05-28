const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

const updateMe = async (userId, { name, currentPassword, newPassword }) => {
  // 1. 변경할 내용이 없으면 현재 사용자 정보 그대로 반환
  if (name === undefined && newPassword === undefined) {
    const row = await userRepository.findById(userId);
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      theme: row.theme,
      language: row.language,
      createdAt: row.created_at,
    };
  }

  // 2. newPassword가 있으면 currentPassword 필수
  if (newPassword !== undefined && !currentPassword) {
    const err = new Error('비밀번호 변경 시 현재 비밀번호가 필요합니다.');
    err.status = 400;
    throw err;
  }

  // 3. currentPassword 있으면 검증
  let hashedPassword;
  if (currentPassword) {
    const userWithPw = await userRepository.findByIdWithPassword(userId);
    const isMatch = await bcrypt.compare(currentPassword, userWithPw.password);
    if (!isMatch) {
      const err = new Error('현재 비밀번호가 올바르지 않습니다.');
      err.status = 401;
      throw err;
    }

    // 4. newPassword 있으면 해싱
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    }
  }

  // 5. 업데이트할 fields 구성
  const fields = {};
  if (name !== undefined) fields.name = name;
  if (hashedPassword !== undefined) fields.password = hashedPassword;

  const row = await userRepository.updateUser(userId, fields);

  // 6. camelCase 변환 후 반환
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    theme: row.theme,
    language: row.language,
    createdAt: row.created_at,
  };
};

module.exports = { updateMe };
