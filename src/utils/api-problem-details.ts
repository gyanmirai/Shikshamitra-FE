export interface ParsedApiProblemDetail {
  detail: string;
  errorCode?: string;
}

const GENERIC_MESSAGES = new Set([
  'one or more business rules were violated',
  'one or more validation errors occurred',
  'something went wrong',
]);

const isGenericMessage = (value: string) => GENERIC_MESSAGES.has(value.trim().toLowerCase());

const addCandidate = (candidates: string[], value: unknown) => {
  if (typeof value === 'string' && value.trim()) {
    candidates.push(value.trim());
  }
};

const addErrorDictionaryCandidates = (candidates: string[], errors: unknown) => {
  if (!errors || typeof errors !== 'object') {
    return;
  }

  Object.values(errors as Record<string, unknown>).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => addCandidate(candidates, item));
      return;
    }

    addCandidate(candidates, value);
  });
};

const addValidationErrorCandidates = (candidates: string[], validationErrors: unknown) => {
  if (!Array.isArray(validationErrors)) {
    return;
  }

  validationErrors.forEach((validationError) => {
    if (typeof validationError === 'string') {
      addCandidate(candidates, validationError);
      return;
    }

    if (validationError && typeof validationError === 'object') {
      const record = validationError as Record<string, unknown>;
      addCandidate(candidates, record.message);
      addCandidate(candidates, record.errorMessage);
    }
  });
};

export function parseApiProblemDetail(error: any): ParsedApiProblemDetail {
  const data = error?.data || {};
  const candidates: string[] = [];

  addCandidate(candidates, data?.data?.Message);
  addCandidate(candidates, data?.data?.message);
  addCandidate(candidates, data?.data?.detail);
  addCandidate(candidates, data?.error?.details);
  addCandidate(candidates, data?.details);
  addValidationErrorCandidates(candidates, data?.error?.validationErrors);
  addValidationErrorCandidates(candidates, data?.validationErrors);
  addErrorDictionaryCandidates(candidates, data?.errors);
  addCandidate(candidates, data?.detail);
  addCandidate(candidates, data?.error?.message);
  addCandidate(candidates, data?.title);
  addCandidate(candidates, error?.error);

  const detail =
    candidates.find((candidate) => !isGenericMessage(candidate)) ||
    candidates[0] ||
    'Something went wrong';

  return {
    detail: String(detail),
    errorCode: data?.errorCode || data?.error?.code || data?.code,
  };
}
