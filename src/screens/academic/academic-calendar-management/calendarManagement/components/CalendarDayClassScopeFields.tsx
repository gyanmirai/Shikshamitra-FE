import type { FormikProps } from 'formik';

import {
  Grid,
  Select,
  Checkbox,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { getCalendarDayOptionLabel, type CalendarDayNamedOption } from '../calendarDayOptions';

import type { CalendarDayFormValues } from '../types';

export interface CalendarStandard extends CalendarDayNamedOption {
  unavailable?: boolean;
  divisions?: { id: string; name: string }[];
}

interface CalendarDayClassScopeFieldsProps {
  formik: Pick<
    FormikProps<CalendarDayFormValues>,
    'values' | 'touched' | 'errors' | 'setFieldValue' | 'handleChange'
  >;
  availableStandards: CalendarStandard[];
  standards: CalendarStandard[];
}

export function CalendarDayClassScopeFields({
  formik,
  availableStandards,
  standards,
}: CalendarDayClassScopeFieldsProps) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl
          fullWidth
          size="small"
          error={formik.touched.standardIds && Boolean(formik.errors.standardIds)}
        >
          <InputLabel>Class *</InputLabel>
          <Select
            multiple
            label="Class *"
            name="standardIds"
            value={formik.values.standardIds}
            onChange={(event) => {
              const { value } = event.target;
              const selected = typeof value === 'string' ? value.split(',') : value;
              formik.setFieldValue('standardIds', selected);
              if (selected.length !== 1) formik.setFieldValue('divisionId', '');
            }}
            renderValue={(selected) =>
              (selected as string[])
                .map((id) => getCalendarDayOptionLabel(availableStandards, id, 'Unavailable class'))
                .join(', ')
            }
          >
            {availableStandards.map((standard) => (
              <MenuItem key={standard.id} value={standard.id} disabled={standard.unavailable}>
                <Checkbox size="small" checked={formik.values.standardIds.includes(standard.id)} />
                {standard.name}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.standardIds && formik.errors.standardIds && (
            <FormHelperText>{formik.errors.standardIds as string}</FormHelperText>
          )}
        </FormControl>
      </Grid>

      {formik.values.standardIds.length === 1 && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="division-select-label" shrink htmlFor="division-select">
              Division
            </InputLabel>
            <Select
              labelId="division-select-label"
              inputProps={{ id: 'division-select' }}
              label="Division"
              name="divisionId"
              value={formik.values.divisionId}
              onChange={formik.handleChange}
              displayEmpty
              notched
              renderValue={(selected) => {
                if (!selected) return <em>All Divisions (optional)</em>;
                const selectedDivision = standards
                  .find((standard) => standard.id === formik.values.standardIds[0])
                  ?.divisions?.find((division) => division.id === selected);
                return selectedDivision?.name ?? String(selected);
              }}
            >
              <MenuItem value="">All Divisions</MenuItem>
              {(
                standards.find((standard) => standard.id === formik.values.standardIds[0])
                  ?.divisions || []
              ).map((division) => (
                <MenuItem key={division.id} value={division.id}>
                  {division.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
}
