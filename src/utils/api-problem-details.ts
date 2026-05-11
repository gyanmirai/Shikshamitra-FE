export interface ParsedApiProblemDetail {
  detail: string;
  errorCode?: string;
}

export function parseApiProblemDetail(error: any): ParsedApiProblemDetail {
  const data = error?.data || {};
  // Prefer the specific business-rule message nested in data.data.message,
  // then fall back to the RFC 7807 detail field, then other fallbacks.
  const detail =
    data?.data?.message ||
    data?.detail ||
    data?.error?.message ||
    error?.error ||
    'Something went wrong';

  return {
    detail: String(detail),
    errorCode: data?.errorCode || data?.error?.code,
  };
}
