import type { AdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';

import CustomSelect from 'src/components/custom-select';
import { FormSectionCard } from 'src/components/form-section-card';
import { Alert, Stack, Button, Switch, FormControlLabel } from '@mui/material';
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
      descriptionTooltip="An exception needs a recorded reason and an authorized decision. Missing information must be corrected before requesting an exception."
    >
      <Stack spacing={1.5}>
        <FormControlLabel
          label="Allow authorized exception requests"
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
              label="Exception approval role (optional)"
              value={policy.exceptionApprovalRole ?? ''}
              disabled={disabled || query.isFetching || query.isError}
              options={[
                { value: '', label: 'Any staff member with exception review permission' },
                ...roles.map((role) => ({ value: role.name, label: role.name })),
                ...(roleMissing
                  ? [
                      {
                        value: policy.exceptionApprovalRole!,
                        label: `${policy.exceptionApprovalRole} (saved role)`,
                      },
                    ]
                  : []),
              ]}
              onChange={(role) => onChange({ exceptionApprovalRole: String(role) || null })}
            />
            {query.isError && (
              <Alert
                severity="warning"
                action={
                  <Button size="small" onClick={query.refetch}>
                    Retry
                  </Button>
                }
              >
                Reviewer roles could not load. The saved role has been preserved.
              </Alert>
            )}
            <FormControlLabel
              label={
                <WorkflowSettingLabel
                  label="Require a different staff member to approve"
                  help="A different authorized staff member reviews and approves the exception request."
                />
              }
              control={
                <Switch
                  size="small"
                  slotProps={{
                    input: { 'aria-label': 'Require a different staff member to approve' },
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
