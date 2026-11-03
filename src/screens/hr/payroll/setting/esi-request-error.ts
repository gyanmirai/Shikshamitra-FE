import { parseApiProblemDetail } from 'src/utils/api-problem-details';

// Use known codes, never echo potentially sensitive server details into payroll forms.
export function esiRequestError(error: unknown, fallback: string): string {
  const status = (error as { status?: unknown } | undefined)?.status;
  if (status === 401)
    return 'Your session needs to be renewed. Keep this form open to preserve your changes.';
  if (status === 403)
    return 'You do not have access to this ESIC action. Ask your administrator to review your permissions and HR scope.';
  switch (parseApiProblemDetail(error).errorCode) {
    case 'HR:Payroll:EsiConfigurationPastMonth':
      return 'This server does not allow ESIC changes for a past month. Keep your draft and ask your administrator to review historical setup.';
    case 'HR:Payroll:EsiConfigurationLocked':
      return 'This change would affect locked, finalized, or paid payroll. Choose an effective month after the protected payroll, or ask your payroll administrator to review the period. Your changes are preserved.';
    case 'ESI_PREVIEW_STALE':
      return 'ESIC settings changed. Review the latest settings before saving. Your changes are preserved.';
    case 'HR:Payroll:EsiPolicyNotEffective':
    case 'HR:Payroll:EsiPolicySelectionInvalid':
      return 'An ESIC policy effective for this month is unavailable. Ask your statutory policy administrator to review the policy dates and staff assignments. Retrying without correcting setup will not resolve this.';
    case 'HR:Payroll:EsiComponentInvalid':
    case 'ShikshaMitra:PayrollComponentInactive':
      return 'An earning component is unavailable. Review active earnings before saving. Your changes are preserved.';
    default:
      return fallback;
  }
}
