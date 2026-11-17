import { parseApiProblemDetail } from 'src/utils/api-problem-details';

/** Older servers may omit the count; never substitute the list's total usage count. */
export function workflowArchiveErrorMessage(error: unknown): string {
  const response = error as any;
  const body = response?.response?.data ?? response?.data ?? response;
  const data = body?.data ?? body?.error?.data;
  const count = data?.ActiveOfferingCount ?? data?.activeOfferingCount;
  if (typeof count === 'number' && Number.isSafeInteger(count) && count > 0) {
    return `This workflow cannot be archived because it is currently used by ${count} active admission offering${count === 1 ? '' : 's'}. Deactivate them or replace their workflow before archiving.`;
  }
  const problem = parseApiProblemDetail(error);
  if (problem.detail && !/business rule|something went wrong|^Admissions\.WorkflowInUse$/i.test(problem.detail)) {
    return problem.detail;
  }
  return 'This workflow cannot be archived because active admission offerings use it. Deactivate them or replace their workflow before archiving.';
}
