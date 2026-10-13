import type {
  AssignmentPolicy,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import CustomSelect from 'src/components/custom-select';
import { FormSectionHeader } from 'src/components/form-section-card';
import { Box, Stack, Alert, Button, Skeleton, TextField, Typography } from '@mui/material';
import {
  useAssignmentPolicyOptionsQuery,
  selectableAssignmentPolicyFamilies,
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
      <FormSectionHeader
        icon="mdi:shield-check-outline"
        title={editing ? 'Student policies' : 'Policy defaults and overrides'}
        descriptionTooltip={
          editing
            ? 'Choose policies for this student. Existing dues, payments and receipts keep their recorded amounts.'
            : 'Policies default to the selected fee structure. Changes here apply only to this student.'
        }
      />
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
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {selectableAssignmentPolicyFamilies.map((family) => {
          const inherited = defaults.find((p) => p.family === family);
          const selected = selections.find((p) => p.family === family);
          const value = selected ? (selected.versionId ?? '') : (inherited?.versionId ?? '');
          const available = [...(options.data ?? []).filter((p) => p.family === family)];
          if (inherited && !available.some((p) => p.versionId === inherited.versionId))
            available.push(inherited);
          const label = `${family.charAt(0).toUpperCase()}${family.slice(1)} policy`;
          const overridden = !editing && value !== (inherited?.versionId ?? '');
          return (
            <Stack key={family} spacing={0.5} sx={{ minWidth: 0 }}>
              <CustomSelect
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
                  overridden
                    ? `Override for this student · default: ${inherited ? `${inherited.name} · v${inherited.version}` : 'No policy assigned'}`
                    : undefined
                }
                onChange={(next) => {
                  const nextVersionId = String(next) || null;
                  const nextSelections = [
                    ...selections.filter((p) => p.family !== family),
                    ...(editing || nextVersionId !== (inherited?.versionId ?? null)
                      ? [{ family, versionId: nextVersionId }]
                      : []),
                  ];
                  const hasOverride = nextSelections.some(
                    (policy) =>
                      policy.versionId !==
                      (defaults.find((item) => item.family === policy.family)?.versionId ?? null)
                  );
                  onChange(nextSelections, hasOverride || editing ? reason : '');
                }}
              />
              {overridden && canOverride && (
                <Button
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                  disabled={disabled}
                  onClick={() => {
                    const nextSelections = selections.filter((policy) => policy.family !== family);
                    onChange(nextSelections, nextSelections.length ? reason : '');
                  }}
                >
                  Reset {family} to fee structure default
                </Button>
              )}
            </Stack>
          );
        })}
      </Box>
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
          You do not have permission to override policies. The fee structure defaults will be used.
        </Typography>
      )}
      {canOverride &&
        !options.isLoading &&
        !options.isError &&
        selectableAssignmentPolicyFamilies.every((family) =>
          (options.data ?? [])
            .filter((policy) => policy.family === family)
            .every(
              (policy) =>
                policy.versionId === defaults.find((item) => item.family === family)?.versionId
            )
        ) && (
          <Alert severity="info">
            No other active policies are available for this student’s academic year.
          </Alert>
        )}
    </Stack>
  );
}
