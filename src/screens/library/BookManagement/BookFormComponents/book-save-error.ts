import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export const bookSaveError = (failure: unknown) =>
  parseApiProblemDetail(failure).detail ||
  (failure instanceof Error
    ? failure.message
    : 'Could not save this book. Your changes are retained.');
