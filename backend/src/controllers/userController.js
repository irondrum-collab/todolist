const { isValidPassword } = require('../utils/validate');
const userService = require('../services/userService');

const updateMe = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword, theme, language } = req.body;
    const userId = req.user.id;

    // name 유효성: 있으면 1~50자
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 50) {
        const err = new Error('이름은 1~50자이어야 합니다.');
        err.status = 400;
        return next(err);
      }
    }

    // newPassword 유효성: 있으면 강도 검사
    if (newPassword !== undefined && !isValidPassword(newPassword)) {
      const err = new Error('비밀번호는 8~128자이며 영문, 숫자, 특수문자를 각 1자 이상 포함해야 합니다.');
      err.status = 400;
      return next(err);
    }

    // theme 유효성: 있으면 'light' | 'dark'
    if (theme !== undefined && !['light', 'dark'].includes(theme)) {
      const err = new Error("theme은 'light' 또는 'dark'이어야 합니다.");
      err.status = 400;
      return next(err);
    }

    // language 유효성: 있으면 'ko' | 'en'
    if (language !== undefined && !['ko', 'en'].includes(language)) {
      const err = new Error("language는 'ko' 또는 'en'이어야 합니다.");
      err.status = 400;
      return next(err);
    }

    const user = await userService.updateMe(userId, { name: name?.trim(), currentPassword, newPassword, theme, language });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateMe };
