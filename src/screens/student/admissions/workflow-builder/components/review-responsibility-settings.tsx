import type { AdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';

import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Switch, FormControlLabel } from '@mui/material';
import { useGetAdmissionReviewRolesQuery } from 'src/redux/student/admissions/admission-review-settings-api';

import { ReviewAssigneeSelect } from './review-assignee-select';

export function ReviewResponsibilitySettings({
  policy,
  disabled,
  available,
  onChange,
}: {
  policy: AdmissionReviewPolicy;
  disabled: boolean;
  available: boolean;
  onChange: (change: Partial<AdmissionReviewPolicy>) => void;
}) {
  const query = useGetAdmissionReviewRolesQuery(undefined, { skip: !available });
  const roles = query.data ?? [];
  const roleOptions = (value: string | null) => [
    { value: '', label: 'Any authorized staff member' },
    ...roles.map((role) => ({ value: role.name, label: role.name })),
    ...(value && !roles.some((role) => role.name === value)
      ? [{ value, label: `${value} (saved role)` }]
      : []),
  ];
  return (
    <Stack spacing={1}>
      <CustomSelect
        fullWidth
        size="small"
        label="Reviewer role (optional)"
        value={policy.reviewerRole ?? ''}
        options={roleOptions(policy.reviewerRole)}
        disabled={disabled || query.isFetching}
        onChange={(value) =>
          onChange({ reviewerRole: value ? String(value) : null, assignedReviewerId: null })
        }
      />
      <ReviewAssigneeSelect
        value={policy.assignedReviewerId}
        role={policy.reviewerRole}
        disabled={disabled}
        available={available}
        onChange={(assignedReviewerId) => onChange({ assignedReviewerId })}
      />
      <FormControlLabel
        label="Require a different person to make the admission decision"
        control={
          <Switch
            size="small"
            disabled={disabled}
            checked={policy.requireIndependentApprover}
            onChange={(_, requireIndependentApprover) => onChange({ requireIndependentApprover })}
          />
        }
      />
      <CustomSelect
        fullWidth
        size="small"
        label="Final approver role (optional)"
        value={policy.approverRole ?? ''}
        options={roleOptions(policy.approverRole)}
        disabled={disabled || query.isFetching}
        onChange={(value) => onChange({ approverRole: value ? String(value) : null })}
        helperText={query.isFetching ? 'Loading roles…' : undefined}
      />
      {query.isError && (
        <StudentFeedback
          notificationKey="STU-0531"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          Roles could not be loaded. Your saved roles are preserved.
        </StudentFeedback>
      )}
    </Stack>
  );
}
