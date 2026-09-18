import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

export function canDecideAdmissionWorkflow(
  workflow: Pick<AdmissionWorkflow, 'status' | 'assignedApproverId'>,
  currentUserId: string | undefined,
  hasApprovePermission: boolean
) {
  return (
    hasApprovePermission &&
    workflow.status === 4 &&
    Boolean(currentUserId) &&
    workflow.assignedApproverId?.toLowerCase() === currentUserId?.toLowerCase()
  );
}
