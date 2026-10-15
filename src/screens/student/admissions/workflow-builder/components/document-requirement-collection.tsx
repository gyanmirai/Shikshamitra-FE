import type { FormikProps } from 'formik';
import type { AdmissionDocumentTypeOption } from 'src/redux/student/admissions/admission-document-settings-api';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { DOCUMENT_FORMATS } from 'src/redux/student/admissions/admission-document-policy';
import { Alert, Stack, Button, Typography, IconButton, InputAdornment } from '@mui/material';

import { DocumentUploadLimits } from './document-upload-limits';

const ADMISSION_EVIDENCE = '__admission_evidence__';

export type DocumentCategoryQueryState = {
  documentTypesLoading?: boolean;
  documentTypesError?: boolean;
  onRetryDocumentTypes?: () => void;
};

type Props = DocumentCategoryQueryState & {
  formik: FormikProps<AdmissionDocumentRequirementPolicy>;
  documentTypes: AdmissionDocumentTypeOption[];
};
export function DocumentRequirementCollection({
  formik,
  documentTypes,
  documentTypesLoading,
  documentTypesError,
  onRetryDocumentTypes,
}: Props) {
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
    { value: ADMISSION_EVIDENCE, label: 'Keep as admission evidence' },
    ...documentTypes.map((item) => ({ value: item.id, label: item.name })),
  ];
  const categoriesEmpty = !documentTypes.length && !documentTypesLoading && !documentTypesError;
  if (categoriesEmpty)
    mappings.push({
      value: '__no_categories__',
      label: 'No student document categories configured',
    });
  if (values.documentTypeId && !documentTypes.some((item) => item.id === values.documentTypeId)) {
    mappings.push({
      value: values.documentTypeId,
      label: 'Previously selected student document type',
    });
  }
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Upload and student record</Typography>
      <DocumentUploadLimits formik={formik} />
      <CustomSelect
        size="small"
        fullWidth
        label="Student document category (optional)"
        isLoading={documentTypesLoading && !documentTypes.length}
        disabledValues={['__no_categories__']}
        disabledLabel="Configure categories in Student Records settings"
        formControlProps={{
          'aria-busy': Boolean(documentTypesLoading),
        }}
        endAdornment={
          <InputAdornment position="end" sx={{ mr: 2.5 }}>
            <CustomTooltip
              title="Accepted uploads connect to the student record and matching Onboarding requirements when admission is finalized."
              arrow
              placement="right"
            >
              <IconButton
                type="button"
                size="small"
                aria-label="Student document category information"
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                sx={{ color: 'info.main', width: { xs: 44, sm: 28 }, height: { xs: 44, sm: 28 } }}
              >
                <Iconify icon="mdi:information-outline" width={16} />
              </IconButton>
            </CustomTooltip>
          </InputAdornment>
        }
        value={values.documentTypeId || ADMISSION_EVIDENCE}
        options={mappings}
        onChange={(id) => changeMapping(id === ADMISSION_EVIDENCE ? '' : String(id))}
        onBlur={() => formik.setFieldTouched('documentTypeId')}
        error={Boolean(touched.documentTypeId && errors.documentTypeId)}
        helperText={
          touched.documentTypeId && errors.documentTypeId ? errors.documentTypeId : undefined
        }
      />
      {documentTypesError && (
        <Alert
          severity="warning"
          action={
            onRetryDocumentTypes && (
              <Button size="small" onClick={onRetryDocumentTypes}>
                Retry
              </Button>
            )
          }
        >
          Student document categories could not load. Retry or keep this as admission evidence.
        </Alert>
      )}
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
          Uploads must also meet this student document category’s file limits. Accepted uploads
          connect to the student record after finalization.
        </Alert>
      )}
    </Stack>
  );
}
