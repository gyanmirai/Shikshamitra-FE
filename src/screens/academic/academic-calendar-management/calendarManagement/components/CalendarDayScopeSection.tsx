import type { FormikProps } from 'formik';

import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Switch, Typography, FormControlLabel } from '@mui/material';

import { type CalendarStandard, CalendarDayClassScopeFields } from './CalendarDayClassScopeFields';

import type { CalendarDayFormValues } from '../types';

interface CalendarDayScopeSectionProps {
  formik: Pick<
    FormikProps<CalendarDayFormValues>,
    'values' | 'touched' | 'errors' | 'setFieldValue' | 'handleChange'
  >;
  availableStandards: CalendarStandard[];
  standards: CalendarStandard[];
}

export function CalendarDayScopeSection({
  formik,
  availableStandards,
  standards,
}: CalendarDayScopeSectionProps) {
  return (
    <FormSectionCard
      icon="solar:eye-linear"
      title="Scope & visibility"
      description="Choose whether this marker applies school-wide or only to selected classes and divisions."
    >
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={formik.values.appliesToAll}
            onChange={(event) => {
              formik.setFieldValue('appliesToAll', event.target.checked);
              if (event.target.checked) {
                formik.setFieldValue('standardIds', []);
                formik.setFieldValue('divisionId', '');
              }
            }}
          />
        }
        label={
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Applies to all classes & divisions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Turn this off to select specific classes or a division.
            </Typography>
          </Box>
        }
      />

      {!formik.values.appliesToAll && (
        <CalendarDayClassScopeFields
          formik={formik}
          availableStandards={availableStandards}
          standards={standards}
        />
      )}
    </FormSectionCard>
  );
}
