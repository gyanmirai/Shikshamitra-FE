import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import { useId, useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';
import {
  Box,
  Alert,
  Radio,
  Stack,
  Button,
  Divider,
  Checkbox,
  FormLabel,
  RadioGroup,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import {
  isWorkAssignmentValid,
  type EmployeeWorkAssignment,
  workAssignmentSelectionError,
} from './work-assignment';

const modes = [
  {
    value: 'specificOrganizations',
    label: 'Specific organization(s)',
    description: 'One or more academic units',
  },
  {
    value: 'schoolWide',
    label: 'School-wide',
    description: 'Not tied to an academic organization',
  },
  { value: 'decideLater', label: 'Decide later', description: 'Leave the assignment undecided' },
] as const;

export function WorkAssignmentField({
  value,
  onChange,
  currentYear,
  disabled = false,
  onValidityChange,
  legacyDepartment,
  confirmation,
}: {
  value: EmployeeWorkAssignment;
  onChange: (value: EmployeeWorkAssignment) => void;
  currentYear?: { id: string; name?: string } | null;
  disabled?: boolean;
  onValidityChange: (valid: boolean) => void;
  legacyDepartment?: string;
  confirmation?: { checked: boolean; onChange: (checked: boolean) => void };
}) {
  const labelId = useId();
  const [touched, setTouched] = useState(false);
  const specific = value.mode === 'specificOrganizations';
  const yearId = specific ? value.academicYearId : undefined;
  const query = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: yearId || '' },
    { skip: !yearId, refetchOnMountOrArgChange: true }
  );
  // Never validate a new year against a previous query argument's cached data.
  const rows = query.currentData?.items;
  const loaded = Boolean(rows) && !query.isFetching && !query.isError;
  const availableIds = (rows || []).map((row) => row.id);
  const valid = isWorkAssignmentValid(value, availableIds, loaded);
  const labelsCurrent =
    !specific ||
    value.organizationIds.every(
      (id, index) => rows?.find((row) => row.id === id)?.label === value.organizationLabels?.[index]
    );
  const confirmChecked = confirmation?.checked;
  const onConfirm = confirmation?.onChange;
  useEffect(() => {
    onValidityChange(valid);
    // A refreshed catalogue must not resurrect a confirmation after invalidation.
    if (confirmChecked && (!valid || !labelsCurrent)) onConfirm?.(false);
  }, [valid, labelsCurrent, onValidityChange, confirmChecked, onConfirm]);
  useEffect(() => {
    setTouched(false);
  }, [value.mode, yearId]);

  const options = useMemo(() => {
    const available = (rows || []).map((row) => ({ id: row.id, label: row.label }));
    value.organizationIds.forEach((id, index) => {
      if (!available.some((row) => row.id === id))
        available.push({ id, label: value.organizationLabels?.[index] || 'Saved organization' });
    });
    return available;
  }, [rows, value.organizationIds, value.organizationLabels]);
  const unavailable = loaded && value.organizationIds.some((id) => !availableIds.includes(id));
  const selectionError = workAssignmentSelectionError(value, availableIds);
  const error = specific && touched && loaded && Boolean(selectionError);
  // The current year cannot supply the display name of a different saved year.
  const yearName =
    value.academicYearName ||
    (yearId && yearId === currentYear?.id ? currentYear.name : undefined) ||
    (yearId ? 'Saved academic year (name unavailable)' : 'Not selected');

  return (
    <FormSectionCard
      title="Organization / Work Assignment"
      icon={GlobalIcons.building}
      descriptionTooltip="Organizational context only. Access permissions are reviewed separately; this choice never grants access."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
    >
      <Stack spacing={2} sx={{ minWidth: 0 }}>
        {legacyDepartment && (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            Previous department: {legacyDepartment}. Retained for reference; no organization is
            inferred.
          </Typography>
        )}
        <FormControl component="fieldset" disabled={disabled}>
          <FormLabel id={labelId} sx={{ typography: 'body2', mb: 1 }}>
            Assignment type
          </FormLabel>
          <RadioGroup
            aria-labelledby={labelId}
            value={value.mode}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
              gap: 1,
            }}
            onChange={(_, mode) =>
              onChange({
                mode: mode as EmployeeWorkAssignment['mode'],
                academicYearId: mode === 'specificOrganizations' ? currentYear?.id || null : null,
                academicYearName: mode === 'specificOrganizations' ? currentYear?.name : undefined,
                organizationIds: [],
              })
            }
          >
            {modes.map((mode) => (
              <FormControlLabel
                key={mode.value}
                value={mode.value}
                control={
                  <Radio
                    size="small"
                    inputProps={{
                      'aria-label': mode.label,
                      'aria-describedby': labelId + mode.value,
                    }}
                  />
                }
                sx={{
                  m: 0,
                  p: 1,
                  minWidth: 0,
                  alignItems: 'flex-start',
                  border: 1,
                  borderRadius: 1.5,
                  borderColor: value.mode === mode.value ? 'primary.main' : 'divider',
                  bgcolor: value.mode === mode.value ? 'action.selected' : 'background.paper',
                  '&:focus-within': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                  },
                }}
                label={
                  <Box
                    component="span"
                    sx={{ display: 'block', pt: 0.75, overflowWrap: 'anywhere' }}
                  >
                    <Typography component="span" display="block" variant="body2" fontWeight={600}>
                      {mode.label}
                    </Typography>
                    <Typography
                      component="span"
                      display="block"
                      variant="caption"
                      color="text.secondary"
                      id={labelId + mode.value}
                    >
                      {mode.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>
        {specific && (
          <Stack spacing={1}>
            <Typography variant="body2">
              <Box component="span" sx={{ color: 'text.secondary' }}>
                Academic year:{' '}
              </Box>
              {yearName}
            </Typography>
            {!yearId && (
              <Alert severity="info">
                Choose an academic year in the school context, or choose School-wide or Decide
                later.
              </Alert>
            )}
            {currentYear?.id && yearId && currentYear.id !== yearId && (
              <Alert
                severity="info"
                action={
                  <Button
                    disabled={disabled}
                    size="small"
                    onClick={() =>
                      onChange({
                        ...value,
                        academicYearId: currentYear.id,
                        academicYearName: currentYear.name,
                        organizationIds: [],
                        organizationLabels: [],
                      })
                    }
                  >
                    Use current year
                  </Button>
                }
              >
                Reviewing a saved year. Switching to {currentYear.name || 'the current year'} clears
                these organization selections.
              </Alert>
            )}
            {query.isError && (
              <Alert
                severity="error"
                action={
                  <Button
                    disabled={disabled || query.isFetching}
                    size="small"
                    onClick={() => query.refetch()}
                  >
                    Retry
                  </Button>
                }
              >
                Could not load organizations. Your selection is retained.
              </Alert>
            )}
            {loaded && rows?.length === 0 && !value.organizationIds.length && (
              <Alert severity="info">
                No academic organizations are available for this year and your scope. Choose
                School-wide or Decide later.
              </Alert>
            )}
            {unavailable && (
              <Alert
                severity="warning"
                action={
                  <Button size="small" disabled={disabled} onClick={() => query.refetch()}>
                    Retry
                  </Button>
                }
              >
                A saved organization is unavailable in this year or your scope. Remove it or retry
                before confirming.
              </Alert>
            )}
            <ShakingTextField error={error}>
              <CustomSelect
                name="workAssignmentOrganizations"
                label="Academic organizations"
                required
                multiple
                isSearch
                size="small"
                fullWidth
                options={options}
                labelKey="label"
                valueKey="id"
                value={value.organizationIds}
                renderValue={() =>
                  value.organizationIds.length
                    ? `${value.organizationIds.length} organization${value.organizationIds.length === 1 ? '' : 's'} selected`
                    : ''
                }
                disabled={disabled || !yearId || query.isFetching || query.isError}
                isLoading={query.isFetching}
                onBlur={() => setTouched(true)}
                error={error}
                helperText={
                  error
                    ? selectionError
                    : 'Search by board, medium or stage. Select up to 100 organizations.'
                }
                onChange={(ids) => {
                  if (disabled || !loaded || !yearId) return;
                  setTouched(true);
                  onChange({
                    ...value,
                    organizationIds: ids as string[],
                    // Availability messages never become saved label snapshots.
                    organizationLabels: (ids as string[]).map(
                      (id) => options.find((row) => row.id === id)?.label || ''
                    ),
                  });
                }}
              />
            </ShakingTextField>
            {value.organizationIds.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Selected organizations
                </Typography>
                <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
                  {value.organizationIds.map((id, index) => (
                    <Typography
                      component="li"
                      variant="body2"
                      key={id + index}
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {options.find((option) => option.id === id)?.label || 'Saved organization'}
                      {loaded && !availableIds.includes(id) && (
                        <Box component="span" sx={{ color: 'warning.main' }}>
                          {' '}
                          — Unavailable
                        </Box>
                      )}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
        {confirmation && (
          <Box>
            <Divider sx={{ mb: 1 }} />
            <FormControlLabel
              sx={{ m: 0, alignItems: 'flex-start' }}
              control={
                <Checkbox
                  size="small"
                  checked={confirmation.checked}
                  disabled={!valid || disabled}
                  onChange={(_, checked) => {
                    if (checked && specific && loaded) {
                      onChange({
                        ...value,
                        organizationLabels: value.organizationIds.map(
                          (id) => rows?.find((row) => row.id === id)?.label || ''
                        ),
                      });
                    }
                    confirmation.onChange(checked);
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ pt: 0.75 }}>
                  I confirm this work assignment
                </Typography>
              }
            />
            {!valid && (
              <Typography variant="caption" color="text.secondary" display="block">
                Review the organizations above to enable confirmation.
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </FormSectionCard>
  );
}

export default WorkAssignmentField;
