import CustomSelect from 'src/components/custom-select';
import { useId, useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useGetAcademicOrganizationOptionsQuery } from 'src/redux/academicOrganizationOptions/academicOrganizationOptionsApi';
import {
  Alert,
  Radio,
  Stack,
  Button,
  FormLabel,
  RadioGroup,
  Typography,
  FormControl,
  FormHelperText,
  FormControlLabel,
} from '@mui/material';

import { isWorkAssignmentValid, type EmployeeWorkAssignment } from './work-assignment';

export function WorkAssignmentField({
  value,
  onChange,
  currentYear,
  disabled = false,
  onValidityChange,
}: {
  value: EmployeeWorkAssignment;
  onChange: (value: EmployeeWorkAssignment) => void;
  currentYear?: { id: string; name?: string } | null;
  disabled?: boolean;
  onValidityChange: (valid: boolean) => void;
}) {
  const labelId = useId();
  const [touched, setTouched] = useState(false);
  const yearId = value.mode === 'specificOrganizations' ? value.academicYearId : undefined;
  const query = useGetAcademicOrganizationOptionsQuery(
    { academicYearId: yearId || '' },
    { skip: !yearId, refetchOnMountOrArgChange: true }
  );
  // currentData prevents a response for a previous year from validating the new choice.
  const rows = query.currentData?.items;
  const valid = isWorkAssignmentValid(
    value,
    rows?.map((row) => row.id) || [],
    Boolean(rows) && !query.isFetching && !query.isError
  );
  useEffect(() => {
    onValidityChange(valid);
  }, [valid, onValidityChange]);
  const options = useMemo(() => {
    const available = (rows || []).map((row) => ({ id: row.id, label: row.label }));
    value.organizationIds.forEach((id, index) => {
      if (!available.some((row) => row.id === id))
        available.push({
          id,
          label: `${value.organizationLabels?.[index] || 'Saved organization'} (unavailable — remove or retry)`,
        });
    });
    return available;
  }, [rows, value.organizationIds, value.organizationLabels]);
  const error = touched && !valid && !query.isFetching && !query.isError;
  return (
    <Stack spacing={1.5}>
      <FormControl component="fieldset" disabled={disabled}>
        <FormLabel id={labelId}>Organization / work assignment</FormLabel>
        <RadioGroup
          aria-labelledby={labelId}
          value={value.mode}
          onChange={(_, mode) => {
            setTouched(false);
            onChange({
              mode: mode as EmployeeWorkAssignment['mode'],
              academicYearId: mode === 'specificOrganizations' ? currentYear?.id || null : null,
              academicYearName: mode === 'specificOrganizations' ? currentYear?.name : undefined,
              organizationIds: [],
            });
          }}
        >
          <FormControlLabel
            value="specificOrganizations"
            control={<Radio size="small" />}
            label="Specific organization(s)"
          />
          <FormControlLabel
            value="schoolWide"
            control={<Radio size="small" />}
            label="School-wide / not tied to an academic organization"
          />
          <FormControlLabel
            value="decideLater"
            control={<Radio size="small" />}
            label="Decide later"
          />
        </RadioGroup>
        <FormHelperText>
          Work assignment is organizational context. Access permissions are reviewed separately.
        </FormHelperText>
      </FormControl>
      {value.mode === 'specificOrganizations' && (
        <>
          <Typography variant="caption" color="text.secondary">
            Academic year: {value.academicYearName || currentYear?.name || 'Not available'}
          </Typography>
          {!yearId && (
            <Alert severity="info">
              Choose an academic year in the school context, or choose School-wide or Decide later.
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
              This saved assignment belongs to a different academic year. Review it or use the
              current year.
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
          {yearId && !query.isError && !query.isFetching && rows?.length === 0 && (
            <Alert severity="info">
              No academic organizations are available for this year and your scope. Choose
              School-wide or Decide later.
            </Alert>
          )}
          <ShakingTextField error={error}>
            <CustomSelect
              name="workAssignmentOrganizations"
              label="Academic organizations"
              required
              multiple
              isSearch
              options={options}
              labelKey="label"
              valueKey="id"
              value={value.organizationIds}
              disabled={disabled || !yearId || query.isFetching || query.isError}
              isLoading={query.isFetching}
              onBlur={() => setTouched(true)}
              error={error}
              helperText={
                error
                  ? 'Select at least one available organization. Remove unavailable selections or retry.'
                  : undefined
              }
              onChange={(ids) => {
                setTouched(true);
                onChange({
                  ...value,
                  organizationIds: ids as string[],
                  organizationLabels: (ids as string[]).map(
                    (id) => options.find((row) => row.id === id)?.label || ''
                  ),
                });
              }}
            />
          </ShakingTextField>
        </>
      )}
    </Stack>
  );
}
