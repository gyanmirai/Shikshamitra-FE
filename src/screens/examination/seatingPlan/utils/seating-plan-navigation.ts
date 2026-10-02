import { academicPaths } from 'src/constants/academic-menu';

export function buildSeatingPlanListUrl(standardId?: string | null, status?: string | null) {
  const params = new URLSearchParams();
  if (standardId) params.set('standardId', standardId);
  if (status && status !== 'all') params.set('status', status);
  const query = params.toString();
  return `${academicPaths.examination.seatAllocation}${query ? `?${query}` : ''}`;
}

export function buildSeatingPlanSetupUrl(
  examId: string,
  standardId: string,
  status?: string | null
) {
  const listUrl = buildSeatingPlanListUrl(standardId, status);
  const params = new URLSearchParams(listUrl.split('?')[1]);
  params.set('step', '0');
  return `${academicPaths.examination.seatAllocationSetup(examId)}?${params.toString()}`;
}
