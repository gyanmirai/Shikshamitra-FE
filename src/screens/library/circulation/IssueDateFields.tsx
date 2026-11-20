import type { FormikProps } from 'formik';
import type { LibraryCopyLookup } from 'src/redux/library/circulation-types';
import type { LibraryCirculationMember } from 'src/redux/library/circulation-members-api';

import { Grid } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';

import { SchoolDateContext } from './SchoolDateContext';
import { CirculationDateField } from './CirculationDateField';

import type { IssueValues } from './useIssueDraft';

export function IssueDateFields({
  formik,
  copy,
  member,
  manual,
  disabled,
}: {
  formik: FormikProps<IssueValues>;
  copy: LibraryCopyLookup | undefined;
  member: LibraryCirculationMember | undefined;
  manual: boolean;
  disabled: boolean;
}) {
  return (
    <FormSectionCard
      title="Loan Dates"
      icon={GlobalIcons.calendar}
      descriptionTooltip="Use school calendar dates. Automatic due dates come from the saved policy; manual rules require an explicit due date."
    >
      <SchoolDateContext
        context={copy?.schoolContext}
        disabled={disabled}
        onUse={(date) => formik.setFieldValue('issueDate', date)}
      />
      <Grid container spacing={2}>
        {member?.role === 1 && (
          <Grid size={12}>
            <ShakingTextField
              error={Boolean(formik.touched.academicYearId && formik.errors.academicYearId)}
            >
              <CustomSelect
                label="Staff loan academic year"
                name="academicYearId"
                required
                fullWidth
                size="small"
                value={formik.values.academicYearId || ''}
                options={copy?.schoolContext?.academicYears || []}
                labelKey="name"
                valueKey="id"
                disabled={disabled}
                onChange={(value) => formik.setFieldValue('academicYearId', String(value))}
                onBlur={() => formik.setFieldTouched('academicYearId', true)}
                error={Boolean(formik.touched.academicYearId && formik.errors.academicYearId)}
                helperText={
                  (formik.touched.academicYearId && formik.errors.academicYearId) ||
                  'Choose the actual academic context for this new staff loan.'
                }
              />
            </ShakingTextField>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: manual ? 6 : 12 }}>
          <CirculationDateField
            label="Issue date"
            name="issueDate"
            value={formik.values.issueDate}
            disabled={disabled}
            error={formik.touched.issueDate && formik.errors.issueDate}
            onChange={(value) => formik.setFieldValue('issueDate', value)}
            onBlur={() => formik.setFieldTouched('issueDate', true)}
          />
        </Grid>
        {manual && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <CirculationDateField
              label="Due date"
              name="dueDate"
              value={formik.values.dueDate}
              disabled={disabled}
              error={formik.touched.dueDate && formik.errors.dueDate}
              onChange={(value) => formik.setFieldValue('dueDate', value)}
              onBlur={() => formik.setFieldTouched('dueDate', true)}
              helperText="This policy requires an explicit due date."
            />
          </Grid>
        )}
      </Grid>
    </FormSectionCard>
  );
}
