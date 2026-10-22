import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Box, Grid, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { localizeAdmissionSection } from '../form-languages';
import AdmissionRuntimeField from '../../admission-runtime-field';
import { AdmissionSectionFields } from '../../components/admission-section-fields';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  sectionIndex: number;
  language: string;
  answers: Record<string, string>;
  onChangeAnswer: (code: string, value: string) => void;
};

export function FormReviewSection({
  formik,
  sectionIndex,
  language,
  answers,
  onChangeAnswer,
}: Props) {
  const section = localizeAdmissionSection(formik.values.sections[sectionIndex], language);
  const columns = formik.values.fieldsPerRow;
  return (
    <SectionCard
      title={section.name}
      paperProps={{ sx: { mb: 0, minWidth: 0, '& h6': { overflowWrap: 'anywhere' } } }}
      gridProps={{ spacing: 1 }}
    >
      <AdmissionSectionFields
        fields={section.fields}
        columns={columns}
        renderField={(field) => (
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
        )}
      />
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
