import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export function payslipActionError(problem: unknown, fallback: string): string {
  if (problem && typeof problem === 'object' && 'status' in problem) {
    if (problem.status === 'FETCH_ERROR' || problem.status === 'TIMEOUT_ERROR') {
      // The server may have committed the request before the connection failed.
      return 'The request could not be confirmed. Check your connection and try again.';
    }
    if (problem.status === 'PARSING_ERROR') return 'The server response could not be read. Try again.';
  }
  const { detail } = parseApiProblemDetail(problem);
  return !detail || detail === 'Something went wrong' ? fallback : detail;
}
