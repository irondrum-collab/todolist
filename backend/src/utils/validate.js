const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LETTER_REGEX = /[A-Za-z]/;
const PASSWORD_DIGIT_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  if (email.length > 254) return false;
  return EMAIL_REGEX.test(email);
};

const isValidPassword = (password) => {
  if (typeof password !== 'string') return false;
  if (password.length < 8 || password.length > 128) return false;
  return (
    PASSWORD_LETTER_REGEX.test(password) &&
    PASSWORD_DIGIT_REGEX.test(password) &&
    PASSWORD_SPECIAL_REGEX.test(password)
  );
};

const requireFields = (body, fields) => {
  return fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });
};

module.exports = { isValidEmail, isValidPassword, requireFields };
