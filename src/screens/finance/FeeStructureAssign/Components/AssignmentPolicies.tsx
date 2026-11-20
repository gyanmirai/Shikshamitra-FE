import type {
  AssignmentPolicy,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailField } from 'src/screens/finance/components/detail-view';
import { Box, Stack, Alert, Button, Skeleton, TextField } from '@mui/material';
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
  flat = false,
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
  flat?: boolean;
}) {
  const restoreConfirmation = useBoolean();
  const options = useAssignmentPolicyOptionsQuery(
    { studentId, academicYearId },
    { skip: !canOverride }
  );
  const changed = selections.some(
    (s) => s.versionId !== (defaults.find((p) => p.family === s.family)?.versionId ?? null)
  );
  const policyControls = (
    <Stack spacing={2}>
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
          const isMissing = !value;
          return (
            <Stack key={family} spacing={0.5} sx={{ minWidth: 0 }}>
              <CustomSelect
                name={`${studentId}-${family}`}
                label={label}
                required
                error={isMissing}
                helperText={
                  isMissing
                    ? `Select a ${family === 'collection' ? 'Collection' : 'Refund'} Policy.`
                    : undefined
                }
                size="small"
                value={value}
                disabled={disabled || !canOverride || options.isLoading || options.isError}
                options={available.map((p) => ({
                  value: p.versionId,
                  label: `${p.name}${p.versionId === inherited?.versionId ? ' · default' : ''}`,
                  version: `v${p.version}`,
                }))}
                optionEndLabelKey="version"
                renderValue={(selectedValue) => {
                  const policy = available.find((p) => p.versionId === selectedValue);
                  return policy
                    ? `${policy.name} · v${policy.version}${policy.versionId === inherited?.versionId ? ' · default' : ''}`
                    : '';
                }}
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
                  onChange(nextSelections, hasOverride ? reason : '');
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
                  Reset {family}
                </Button>
              )}
            </Stack>
          );
        })}
      </Box>
      {!editing && selections.length > 0 && (
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          sx={{ alignSelf: 'flex-start' }}
          disabled={disabled}
          onClick={restoreConfirmation.onTrue}
        >
          Restore Defaults
        </Button>
      )}
      {changed && (
        <TextField
          label={editing ? 'Policy change reason' : 'Policy override reason'}
          required
          size="small"
          fullWidth
          multiline
          minRows={2}
          value={reason}
          disabled={disabled}
          onChange={(e) => onChange(selections, e.target.value)}
          slotProps={{ htmlInput: { maxLength: 500 } }}
          error={!reason.trim()}
          helperText={!reason.trim() ? 'Enter a reason for changing policies.' : undefined}
        />
      )}
    </Stack>
  );
  const policyContent = (
    <Stack spacing={2}>
      <ConfirmDialog
        open={restoreConfirmation.value}
        onClose={restoreConfirmation.onFalse}
        title="Restore Default Policies?"
        icon="warning"
        content="This will replace the current policy selections with the fee structure defaults and clear the policy override reason. Fee amounts and service dates will stay as entered."
        action={
          <Button
            variant="contained"
            disabled={disabled}
            onClick={() => {
              onChange([], '');
              restoreConfirmation.onFalse();
            }}
          >
            Restore Defaults
          </Button>
        }
      />
      {!canOverride && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1.5,
          }}
        >
          {selectableAssignmentPolicyFamilies.map((family) => {
            const inherited = defaults.find((policy) => policy.family === family);
            const selected = selections.find((policy) => policy.family === family);
            const policy = selected
              ? [...(options.data ?? []), ...defaults].find(
                  (item) => item.versionId === selected.versionId
                )
              : inherited;
            return (
              <DetailField
                key={family}
                label={family === 'refund' ? 'Refund policy' : 'Collection policy'}
                value={
                  policy
                    ? `${policy.name} · v${policy.version}`
                    : selected?.versionId
                      ? 'Unavailable policy'
                      : 'No policy assigned'
                }
              />
            );
          })}
        </Box>
      )}
      {canOverride && policyControls}
    </Stack>
  );
  if (editing)
    return (
      <FormSectionCard
        title="Student Policies"
        icon="mdi:shield-check-outline"
        descriptionTooltip="Update this student's assigned policies and enter a reason for the change."
      >
        {policyContent}
      </FormSectionCard>
    );
  if (!flat) return policyContent;
  return (
    <FormSectionCard
      title="Policies"
      icon="mdi:shield-check-outline"
      descriptionTooltip="Review the structure's policies or override them for this assignment."
    >
      {policyContent}
    </FormSectionCard>
  );
}
