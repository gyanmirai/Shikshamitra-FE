import type { AdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';

import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Button, Switch, FormControlLabel } from '@mui/material';
import { useGetEligibilityReviewerRolesQuery } from 'src/redux/student/admissions/admission-eligibility-settings-api';

import { WorkflowSettingLabel } from './workflow-setting-label';

export function EligibilityExceptionSettings({
  policy,
  disabled,
  onChange,
}: {
  policy: AdmissionEligibilityPolicy;
  disabled: boolean;
  onChange: (value: Partial<AdmissionEligibilityPolicy>) => void;
}) {
  const query = useGetEligibilityReviewerRolesQuery(undefined, {
    skip: !policy.allowExceptions || disabled,
  });
  const roles = query.data ?? [];
  const roleMissing =
    policy.exceptionApprovalRole &&
    !roles.some((role) => role.name === policy.exceptionApprovalRole);
  return (
    <FormSectionCard
      icon="mdi:shield-check-outline"
      title="Exceptions"
      descriptionTooltip="An Exception Needs a Recorded Reason and an Authorized Decision. Missing Information Must Be Corrected Before Requesting an Exception."
    >
      <Stack spacing={1.5}>
        <FormControlLabel
          label="Allow Authorized Exception Requests"
          control={
            <Switch
              size="small"
              disabled={disabled}
              checked={policy.allowExceptions}
              onChange={(_, allowExceptions) => onChange({ allowExceptions })}
            />
          }
        />
        {policy.allowExceptions && (
          <Stack spacing={1.5}>
            <CustomSelect
              fullWidth
              size="small"
              label="Exception Approval Role (Optional)"
              value={policy.exceptionApprovalRole ?? ''}
              disabled={disabled || query.isFetching || query.isError}
              options={[
                { value: '', label: 'Any Staff Member with Exception Review Permission' },
                ...roles.map((role) => ({ value: role.name, label: role.name })),
                ...(roleMissing
                  ? [
                      {
                        value: policy.exceptionApprovalRole!,
                        label: `${policy.exceptionApprovalRole} (Saved Role)`,
                      },
                    ]
                  : []),
              ]}
              onChange={(role) => onChange({ exceptionApprovalRole: String(role) || null })}
            />
            {query.isError && (
              <StudentFeedback
                notificationKey="STU-0517"
                presentation="persistent"
                severity="warning"
                action={
                  <Button size="small" onClick={query.refetch}>
                    Retry
                  </Button>
                }
              >
                Reviewer roles could not load. The saved role has been preserved.
              </StudentFeedback>
            )}
            <FormControlLabel
              label={
                <WorkflowSettingLabel
                  label="Require a Different Staff Member to Approve"
                  help="A different authorized staff member reviews and approves the exception request."
                />
              }
              control={
                <Switch
                  size="small"
                  slotProps={{
                    input: { 'aria-label': 'Require a Different Staff Member to Approve' },
                  }}
                  disabled={disabled}
                  checked={policy.requireIndependentReviewer}
                  onChange={(_, requireIndependentReviewer) =>
                    onChange({ requireIndependentReviewer })
                  }
                />
              }
            />
          </Stack>
        )}
      </Stack>
    </FormSectionCard>
  );
}
