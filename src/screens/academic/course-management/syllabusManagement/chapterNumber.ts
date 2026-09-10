export const MIN_CHAPTER_NUMBER = 1;
export const MAX_CHAPTER_NUMBER = 1000;

export const CHAPTER_NUMBER_REQUIRED_MESSAGE = 'Chapter Number is required';
export const CHAPTER_NUMBER_INTEGER_MESSAGE = 'Chapter Number must be a whole number';
export const CHAPTER_NUMBER_RANGE_MESSAGE = `Chapter Number must be between ${MIN_CHAPTER_NUMBER} and ${MAX_CHAPTER_NUMBER}`;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;

const getValidationErrors = (error: unknown): Record<string, unknown> | undefined => {
  const errorRecord = asRecord(error);
  const data = asRecord(errorRecord?.data);
  const nestedError = asRecord(data?.error);

  return asRecord(data?.errors) ?? asRecord(nestedError?.errors);
};

const isChapterNumberPath = (path: string) => {
  const normalizedPath = path.replace(/\[\d+\]/g, '').replace(/^\$\.?/, '');
  return normalizedPath.split('.').at(-1)?.toLowerCase() === 'chapterno';
};

const getMessages = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((message): message is string => typeof message === 'string');
  }

  return typeof value === 'string' ? [value] : [];
};

export const getChapterNumberApiError = (error: unknown): string | undefined => {
  const validationErrors = getValidationErrors(error);
  if (!validationErrors) return undefined;

  const chapterNumberEntry = Object.entries(validationErrors).find(([path]) =>
    isChapterNumberPath(path)
  );
  if (!chapterNumberEntry) return undefined;

  const messageText = getMessages(chapterNumberEntry[1]).join(' ').toLowerCase();
  if (messageText.includes('required')) return CHAPTER_NUMBER_REQUIRED_MESSAGE;
  if (messageText.includes('whole number') || messageText.includes('integer')) {
    return CHAPTER_NUMBER_INTEGER_MESSAGE;
  }

  return CHAPTER_NUMBER_RANGE_MESSAGE;
};
