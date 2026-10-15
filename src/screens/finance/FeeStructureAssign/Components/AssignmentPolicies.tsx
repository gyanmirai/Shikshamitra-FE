import type {
  AssignmentPolicy,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
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
                value={value}
                disabled={disabled || !canOverride || options.isLoading || options.isError}
                options={[
                  ...(family !== 'collection' ? [{ value: '', label: 'No policy assigned' }] : []),
                  ...available.map((p) => ({
                    value: p.versionId,
                    label: `${p.name} · v${p.version}${p.versionId === inherited?.versionId ? ' · default' : ''}`,
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
                  Reset {family}
                </Button>
              )}
            </Stack>
          );
        })}
      </Box>
      {!editing && selections.length > 0 && (
        <Button size="small" disabled={disabled} onClick={() => onChange([], '')}>
          Restore defaults
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
          <CustomTooltip
            title="No other policies are available for this academic year."
            arrow
            placement="right"
          >
            <IconButton
              size="small"
              color="info"
              aria-label="Policy availability information"
              sx={{ alignSelf: 'flex-start' }}
            >
              <Iconify icon="mdi:information-outline" width={18} />
            </IconButton>
          </CustomTooltip>
        )}
    </Stack>
  );
  return (
    <Stack spacing={2}>
      {!editing && (!canOverride || !flat) && (
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
              <Stack
                key={family}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {family} policy
                  </Typography>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {policy
                      ? `${policy.name} · v${policy.version}`
                      : selected?.versionId
                        ? 'Unavailable policy'
                        : 'None'}
                  </Typography>
                </Box>
                <CustomTooltip
                  title={selected ? 'Student override' : 'Fee structure default'}
                  arrow
                  placement="right"
                >
                  <IconButton
                    size="small"
                    color="info"
                    aria-label={`${family} policy source information`}
                  >
                    <Iconify icon="mdi:information-outline" width={16} />
                  </IconButton>
                </CustomTooltip>
              </Stack>
            );
          })}
        </Box>
      )}
      {canOverride &&
        (flat ? (
          policyControls
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
      {!canOverride && (
        <CustomTooltip title="Policy changes require override access." arrow placement="right">
          <IconButton
            size="small"
            color="info"
            aria-label="Policy override access information"
            sx={{ alignSelf: 'flex-start' }}
          >
            <Iconify icon="mdi:information-outline" width={18} />
          </IconButton>
        </CustomTooltip>
      )}
    </Stack>
  );
}
