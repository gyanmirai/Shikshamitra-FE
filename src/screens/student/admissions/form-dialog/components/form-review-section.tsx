import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { localizeAdmissionSection } from '../form-languages';
import AdmissionRuntimeField from '../../admission-runtime-field';
import { isAdmissionCopiedAddressField } from '../../admission-address-sync';
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
  const columns = section.fieldsPerRow ?? formik.values.fieldsPerRow;
  return (
    <FormSectionCard
      title={section.name}
      icon={GlobalIcons.admissionDetails}
      sx={{ minWidth: 0, '& h6': { overflowWrap: 'anywhere' } }}
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
              preview
              disabled={
                formik.isSubmitting ||
                field.readOnly ||
                isAdmissionCopiedAddressField(field, formik.values.sections, answers)
              }
              onChange={(value) => onChangeAnswer(field.code, value)}
            />
          </Box>
        )}
      />
      {!section.fields.length && (
        <Typography variant="body2" color="text.secondary">
          No fields in this section. Return to Build form to add fields.
        </Typography>
      )}
    </FormSectionCard>
  );
}
