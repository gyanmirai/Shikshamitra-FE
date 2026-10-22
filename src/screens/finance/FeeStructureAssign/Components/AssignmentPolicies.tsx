import type {
  AssignmentPolicy,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { DetailField, DetailSection } from 'src/components/detail-view';
import {
  useAssignmentPolicyOptionsQuery,
  selectableAssignmentPolicyFamilies,
} from 'src/redux/finance/studentFeeAssignment';
import {
  Box,
  Stack,
  Alert,
  Button,
  Skeleton,
  TextField,
  Accordion,
  IconButton,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

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
  const editMode = useBoolean();
  const restoreConfirmation = useBoolean();
  const options = useAssignmentPolicyOptionsQuery(
    { studentId, academicYearId },
    { skip: !canOverride }
  );
  const changed =
    editing ||
    selections.some(
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
          return (
            <Stack key={family} spacing={0.5} sx={{ minWidth: 0 }}>
              <CustomSelect
                name={`${studentId}-${family}`}
                label={label}
                size="small"
                value={value}
                disabled={disabled || !canOverride || options.isLoading || options.isError}
                options={[
                  ...(family !== 'collection' ? [{ value: '', label: 'No policy assigned' }] : []),
                  ...available.map((p) => ({
                    value: p.versionId,
                    label: `${p.name} · v${p.version}${p.versionId === inherited?.versionId ? ' · default' : ''}`,
                  })),
                ]}

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
        content="This will replace this student's policy selections with the fee structure defaults and clear the policy override reason. Fee amounts and service dates will stay as entered."
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
      {!editing && (!canOverride || !flat || !editMode.value) && (
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
                label={`${family} policy`}
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
      {canOverride &&
        (flat ? (
          (editing || editMode.value) && policyControls
        ) : (
          <Accordion
            disableGutters
            elevation={0}
            defaultExpanded={editing || changed}
            sx={{ '&::before': { display: 'none' }, border: 1, borderColor: 'divider' }}
          >
            <AccordionSummary disabled={disabled} expandIcon={<Iconify icon="mdi:chevron-down" />}>
              <Typography variant="subtitle2">
                {editing ? 'Student policies' : 'Change policies'}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>{policyControls}</AccordionDetails>
          </Accordion>
        ))}
    </Stack>
  );
  if (!flat || editing) return policyContent;
  const actionLabel = editMode.value ? 'Finish editing policies' : 'Edit policies';
  return (
    <DetailSection
      title="Policies"
      icon="mdi:shield-check-outline"
      action={
        <CustomTooltip
          title={
            !canOverride
              ? 'Policy editing requires fee assignment policy override access.'
              : actionLabel
          }
          arrow
          placement="right"
        >
          <span>
            <IconButton
              size="small"
              aria-label={actionLabel}
              aria-expanded={editMode.value}
              disabled={disabled || !canOverride}
              onClick={editMode.onToggle}
            >
              <Iconify icon={editMode.value ? GlobalIcons.submit : GlobalIcons.edit} width={18} />
            </IconButton>
          </span>
        </CustomTooltip>
      }
    >
      {policyContent}
    </DetailSection>
  );
}
