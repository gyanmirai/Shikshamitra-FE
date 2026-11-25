import {
  isApiProblemCodeMessage,
  parseApiProblemDetail,
  isGenericApiProblemMessage,
} from 'src/utils/api-problem-details';

export function getFinanceSettingErrorMessage(
  error: unknown,
  fallback: string,
  problem = parseApiProblemDetail(error)
) {
  const status = (error as { status?: unknown } | null)?.status;
  if (status === 'FETCH_ERROR' || status === 'PARSING_ERROR' || status === 'TIMEOUT_ERROR') {
    return fallback;
  }
  const { detail, errorCode } = problem;
  const generic = /^(?:(?:the )?request failed|bad request|invalid request|internal server error|validation failed|conflict)\.?$/i;
  if (
    (typeof status === 'number' && status >= 500 && !errorCode) ||
    generic.test(detail) ||
    isGenericApiProblemMessage(detail) ||
    isApiProblemCodeMessage(detail) ||
    detail === errorCode
  ) {
    return fallback;
  }
  return detail;
}
