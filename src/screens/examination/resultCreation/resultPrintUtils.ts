const INVALID_FILENAME_CHARACTERS = /[<>:"/\\|?*]/g;

const toFilenamePart = (value: unknown, fallback: string): string => {
  const normalized = String(value ?? '')
    .trim()
    .replace(INVALID_FILENAME_CHARACTERS, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '');

  return normalized || fallback;
};

export const buildStudentResultDocumentTitle = (studentName: unknown, examName: unknown): string =>
  `${toFilenamePart(studentName, 'Student')}_${toFilenamePart(examName, 'Exam')}_Result`;
