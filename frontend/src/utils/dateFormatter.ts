export function formatDate(date: string | null): string {
  if (!date) return '날짜 미지정';

  const [year, month, day] = date.split('-');
  return `${year}-${month}-${day}`;
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return '날짜 미지정';
  if (startDate && !endDate) return `${formatDate(startDate)} ~`;
  if (!startDate && endDate) return `~ ${formatDate(endDate)}`;
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
}
