type ApiErrorPayload = {
  detail?: unknown;
  errorCode?: unknown;
  message?: unknown;
  error?: {
    code?: unknown;
    message?: unknown;
    details?: unknown;
    validationErrors?: Array<{ message?: unknown }>;
  };
};

const knownErrorMessages: Record<string, string> = {
  'AdmissionCrm:ExamSlotCapacityFull':
    'That exam slot has just filled. Choose another slot or refresh capacity.',
  'AdmissionCrm:ExamSlotInactive': 'That exam slot is inactive. Choose an active slot.',
  'AdmissionCrm:ExamSlotAlreadyStarted':
    'That exam slot has already started. Choose a future slot.',
  'AdmissionCrm:InvalidContactNumber':
    'Enter a valid contact number containing 7 to 15 digits.',
  'AdmissionCrm:RegistrationConcurrencyConflict':
    'This registration changed in another session. Reload it before saving again.',
  'AdmissionCrm:RegistrationConcurrencyStampRequired':
    'Reload this registration before saving so the latest version is protected.',
};

const asMessage = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

export const getEnrollmentApiErrorCode = (error: unknown) => {
  if (typeof error !== 'object' || !error || !('data' in error)) return undefined;
  const {data} = (error as { data?: ApiErrorPayload });
  return asMessage(data?.error?.code) || asMessage(data?.errorCode);
};

export const getEnrollmentApiErrorMessage = (error: unknown, fallback: string) => {
  const code = getEnrollmentApiErrorCode(error);
  if (code && knownErrorMessages[code]) return knownErrorMessages[code];

  if (typeof error !== 'object' || !error) return fallback;
  const status = 'status' in error ? (error as { status?: unknown }).status : undefined;
  if (status === 401) return 'Your session expired. Sign in again before retrying.';
  if (status === 403) return 'You do not have permission to complete this enrollment action.';
  if (status === 404) return 'This enrollment record is no longer available. Refresh the workspace.';
  if (status === 409) return 'The record changed in another session. Refresh it before retrying.';
  if (status === 422) return 'Review the highlighted enrollment fields and try again.';
  if (typeof status === 'number' && status >= 500) {
    return 'The enrollment service is temporarily unavailable. Your changes were not confirmed.';
  }

  if (!('data' in error)) return fallback;
  const {data} = (error as { data?: ApiErrorPayload });
  const validationMessage = data?.error?.validationErrors
    ?.map((item) => asMessage(item.message))
    .find(Boolean);
  return (
    validationMessage ||
    asMessage(data?.error?.message) ||
    asMessage(data?.message) ||
    asMessage(data?.detail) ||
    fallback
  );
};
