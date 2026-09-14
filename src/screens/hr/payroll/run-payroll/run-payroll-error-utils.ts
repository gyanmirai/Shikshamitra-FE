import { parseApiProblemDetail } from 'src/utils/api-problem-details';

export function getPayrollMutationErrorMessage(error: unknown): string {
  const problem = parseApiProblemDetail(error);
  if (problem.errorCode === 'PAYROLL_PREVIEW_STALE') {
    return 'Payroll inputs changed. Refresh the preview and review the updated amounts before continuing.';
  }
  return problem.detail === 'Something went wrong'
    ? 'The payroll action could not be completed. Refresh the page and try again.'
    : problem.detail;
}
