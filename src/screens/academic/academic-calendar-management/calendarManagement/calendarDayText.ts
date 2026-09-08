const AUTO_CREATED_DESCRIPTION_PATTERN = /\.?\s*Auto-created from examination schedule\.?/gi;
const EXAM_ID_DESCRIPTION_PATTERN = /\.?\s*ExamId:\s*[\w-]+/gi;

export const normalizeCalendarDayTitle = (title: string): string => title.trim();

export const getVisibleCalendarDayDescription = (description: string): string => {
  const sanitizedDescription = description
    .replace(AUTO_CREATED_DESCRIPTION_PATTERN, '')
    .replace(EXAM_ID_DESCRIPTION_PATTERN, '');

  // Preserve user-entered whitespace exactly. Trimming is only needed after removing
  // legacy system metadata, where the removed suffix can leave separators behind.
  return sanitizedDescription === description ? description : sanitizedDescription.trim();
};
