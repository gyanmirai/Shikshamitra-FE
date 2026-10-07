import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Box, Grid, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import AdmissionRuntimeField from '../../admission-runtime-field';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  answers: Record<string, string>;
  onChangeAnswer: (code: string, value: string) => void;
};

export function FormReviewSection({ formik, sectionIndex, answers, onChangeAnswer }: Props) {
  const section = formik.values.sections[sectionIndex];
  const columns = formik.values.fieldsPerRow;
  return (
    <SectionCard
      title={section.name}
      paperProps={{ sx: { mb: 0, minWidth: 0, '& h6': { overflowWrap: 'anywhere' } } }}
      gridProps={{ spacing: 1.5 }}
    >
      {section.fields.map((field) => (
        <Grid
          key={field.id}
          size={{
            xs: 12,
            sm: field.fieldType === 1 ? 12 : 12 / Math.min(columns, 2),
            lg: field.fieldType === 1 ? 12 : 12 / columns,
          }}
        >
          <Box
            sx={{ minWidth: 0 }}
            onKeyDownCapture={(event) => {
              if (
                event.key === 'Enter' &&
                event.target instanceof HTMLInputElement &&
                event.target.getAttribute('role') !== 'combobox'
              )
                event.preventDefault();
            }}
          >
            <AdmissionRuntimeField
              field={field}
              value={answers[field.code] ?? ''}
              formValues={answers}
              disabled={formik.isSubmitting || field.readOnly}
              onChange={(value) => onChangeAnswer(field.code, value)}
            />
          </Box>
        </Grid>
      ))}
      {!section.fields.length && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            No fields in this section. Return to Build form to add fields.
          </Typography>
        </Grid>
      )}
    </SectionCard>
  );
}
