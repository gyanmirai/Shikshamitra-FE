import type { FormikProps } from 'formik';
import type { AdmissionDocumentTypeOption } from 'src/redux/student/admissions/admission-document-settings-api';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import CustomSelect from 'src/components/custom-select';
import { Alert, Stack, Typography } from '@mui/material';
import { DOCUMENT_FORMATS } from 'src/redux/student/admissions/admission-document-policy';

import { DocumentUploadLimits } from './document-upload-limits';

type Props = {
  formik: FormikProps<AdmissionDocumentRequirementPolicy>;
  documentTypes: AdmissionDocumentTypeOption[];
};
export function DocumentRequirementCollection({ formik, documentTypes }: Props) {
  const { values, touched, errors } = formik;
  const uploads = values.collectionMode !== 'original';
  const selectedMapping = documentTypes.find((item) => item.id === values.documentTypeId);
  const incompatible =
    uploads &&
    selectedMapping &&
    !values.allowedExtensions.some((extension) =>
      selectedMapping.allowedExtensions.includes(extension)
    );
  const changeMapping = (id: string) => {
    const mapped = documentTypes.find((item) => item.id === id);
    formik.setValues({
      ...values,
      documentTypeId: id || undefined,
      ...(mapped
        ? {
            allowedExtensions:
              values.collectionMode === 'original'
                ? values.allowedExtensions.length
                  ? values.allowedExtensions
                  : [...DOCUMENT_FORMATS]
                : mapped.allowedExtensions.filter((ext) => DOCUMENT_FORMATS.includes(ext)),
            maxFileSizeMb: Math.max(1, Math.min(20, Math.ceil(mapped.maxFileSizeMb))),
          }
        : {}),
    });
  };
  const mappings = [
    { value: '', label: 'Keep as admission evidence' },
    ...documentTypes.map((item) => ({ value: item.id, label: item.name })),
  ];
  if (values.documentTypeId && !documentTypes.some((item) => item.id === values.documentTypeId)) {
    mappings.push({
      value: values.documentTypeId,
      label: 'Previously selected student document type',
    });
  }
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Collection and student record</Typography>
      <CustomSelect
        size="small"
        fullWidth
        label="Evidence to collect"
        value={values.collectionMode}
        options={[
          { value: 'upload', label: 'Upload a file' },
          { value: 'original', label: 'Inspect the physical original' },
          { value: 'either', label: 'File upload or physical original' },
          { value: 'both', label: 'File upload and physical original' },
        ]}
        onChange={(value) =>
          formik.setValues({
            ...values,
            collectionMode: value as AdmissionDocumentRequirementPolicy['collectionMode'],
            ...(value === 'original' && values.allowedExtensions.length === 0
              ? { allowedExtensions: [...DOCUMENT_FORMATS] }
              : {}),
          })
        }
      />
      {uploads && <DocumentUploadLimits formik={formik} />}
      <CustomSelect
        size="small"
        fullWidth
        label="Student document category (optional)"
        value={values.documentTypeId ?? ''}
        options={mappings}
        onChange={(id) => changeMapping(String(id))}
        onBlur={() => formik.setFieldTouched('documentTypeId')}
        error={Boolean(touched.documentTypeId && errors.documentTypeId)}
        helperText={
          touched.documentTypeId && errors.documentTypeId
            ? errors.documentTypeId
            : 'Evidence is linked to the student when admission is finalized. A category also connects accepted uploads to onboarding requirements.'
        }
      />
      {incompatible && (
        <Alert severity="error">
          This category and the selected upload formats have no format in common. Choose another
          category, change the formats, or keep this as admission evidence.
        </Alert>
      )}
      {selectedMapping && uploads && (
        <Typography variant="caption" color="text.secondary">
          Category limits: {selectedMapping.allowedExtensions.join(', ').toUpperCase()} · Maximum{' '}
          {selectedMapping.maxFileSizeMb} MB. Both category and requirement limits apply.
        </Typography>
      )}
      {values.documentTypeId && (
        <Alert severity="info">
          Uploads must also meet this student document category’s file limits. Waivers and original
          checks do not replace a required onboarding upload.
        </Alert>
      )}
    </Stack>
  );
}
