type QueryErrorWithStatus = {
  status?: unknown;
};

export function isAdmissionApplicationNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as QueryErrorWithStatus).status === 404
  );
}
