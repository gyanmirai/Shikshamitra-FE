export function getWorkflowErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'The seating plan could not be updated.';

  const response = error as {
    data?: {
      detail?: string;
      message?: string;
      error?: { message?: string };
    };
  };

  return (
    response.data?.error?.message ??
    response.data?.detail ??
    response.data?.message ??
    'The seating plan could not be updated.'
  );
}
