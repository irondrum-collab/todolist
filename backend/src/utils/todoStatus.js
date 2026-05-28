const calcStatus = (isCompleted, startDate, endDate) => {
  if (isCompleted) return '완료';
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (!startDate && !endDate) return '진행 중 (날짜 없음)';
  if (startDate && today < startDate) return '시작 전';
  if (endDate && today > endDate) return '기한 초과';
  return '진행 중';
};

module.exports = { calcStatus };
