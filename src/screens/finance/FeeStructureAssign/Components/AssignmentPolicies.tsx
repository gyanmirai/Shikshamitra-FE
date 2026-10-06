import type {
  AssignmentPolicy,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import CustomSelect from 'src/components/custom-select';
import { Stack, Alert, Button, Skeleton, TextField, Typography } from '@mui/material';
import {
  assignmentPolicyFamilies,
  useAssignmentPolicyOptionsQuery,
} from 'src/redux/finance/studentFeeAssignment';

export default function AssignmentPolicies({
  studentId,
  academicYearId,
  defaults,
  selections,
  reason,
  onChange,
  canOverride,
  disabled = false,
  editing = false,
}: {
  studentId: string;
  academicYearId: string;
  defaults: AssignmentPolicy[];
  selections: AssignmentPolicySelection[];
  reason: string;
  onChange: (selections: AssignmentPolicySelection[], reason: string) => void;
  canOverride: boolean;
  disabled?: boolean;
  editing?: boolean;
}) {
  const options = useAssignmentPolicyOptionsQuery(
    { studentId, academicYearId },
    { skip: !canOverride }
  );
  const changed =
    editing ||
    selections.some(
      (s) => s.versionId !== (defaults.find((p) => p.family === s.family)?.versionId ?? null)
    );
  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {editing
          ? 'Choose policies for this student. Existing dues, payments and receipts keep their recorded amounts. Proration is inherited from the fee structure and cannot be changed here.'
          : 'Policies default to the selected fee structure. Overrides apply only to this student. Proration is inherited from the fee structure.'}
      </Typography>
      {options.isLoading && <Skeleton height={48} />}
      {options.isError && (
        <Alert
          severity="error"
          action={
            <Button disabled={disabled} onClick={() => options.refetch()}>
              Retry
            </Button>
          }
        >
          Policy choices could not be loaded. Retry to change a policy.
        </Alert>
      )}
      {assignmentPolicyFamilies
        .filter((family) => family !== 'proration')
        .map((family) => {
          const inherited = defaults.find((p) => p.family === family);
          const selected = selections.find((p) => p.family === family);
          const value = selected ? (selected.versionId ?? '') : (inherited?.versionId ?? '');
          const available = [...(options.data ?? []).filter((p) => p.family === family)];
          if (inherited && !available.some((p) => p.versionId === inherited.versionId))
            available.push(inherited);
          const label = `${family.charAt(0).toUpperCase()}${family.slice(1)} policy`;
          return (
            <CustomSelect
              key={family}
              name={`${studentId}-${family}`}
              label={label}
              value={value}
              disabled={disabled || !canOverride || options.isLoading || options.isError}
              options={[
                ...(family !== 'collection' ? [{ value: '', label: 'No policy assigned' }] : []),
                ...available.map((p) => ({
                  value: p.versionId,
                  label: `${p.name} · v${p.version}${p.versionId === inherited?.versionId ? (editing ? ' · currently assigned' : ' · fee structure default') : ''}`,
                })),
              ]}
              helperText={
                !editing && selected && selected.versionId !== (inherited?.versionId ?? null)
                  ? `Student override · default: ${inherited ? `${inherited.name} · v${inherited.version}` : 'No policy assigned'}`
                  : undefined
              }
              onChange={(next) =>
                onChange(
                  [
                    ...selections.filter((p) => p.family !== family),
                    { family, versionId: String(next) || null },
                  ],
                  reason
                )
              }
            />
          );
        })}
      {!editing && selections.length > 0 && (
        <Button size="small" disabled={disabled} onClick={() => onChange([], '')}>
          Restore fee structure defaults
        </Button>
      )}
      {changed && (
        <TextField
          label={editing ? 'Policy change reason' : 'Policy override reason'}
          required
          multiline
          minRows={2}
          value={reason}
          disabled={disabled}
          onChange={(e) => onChange(selections, e.target.value)}
          slotProps={{ htmlInput: { maxLength: 500 } }}
          error={!reason.trim()}
          helperText={
            !reason.trim()
              ? 'Enter a reason for changing the assigned policies.'
              : 'Recorded with this student’s policy selection.'
          }
        />
      )}
      {!canOverride && (
        <Typography variant="caption" color="text.secondary">
          Your access allows using the fee structure’s policies. Policy overrides require assignment
          policy override permission.
        </Typography>
      )}
    </Stack>
  );
}
