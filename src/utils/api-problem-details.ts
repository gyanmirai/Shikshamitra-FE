export interface ParsedApiProblemDetail {
  detail: string;
  errorCode?: string;
}

export function parseApiProblemDetail(error: any): ParsedApiProblemDetail {
  const data = error?.data || {};
  const detail = data?.detail || data?.error?.message || error?.error || 'Something went wrong';

  return {
    detail: String(detail),
    errorCode: data?.errorCode || data?.error?.code,
  };
}
