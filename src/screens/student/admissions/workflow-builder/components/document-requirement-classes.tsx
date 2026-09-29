import type { FormikProps } from 'formik';
import type { AdmissionDocumentRequirementPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { Alert, Stack, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { useGetAdmissionDocumentClassesQuery } from 'src/redux/student/admissions/admission-document-settings-api';

export function DocumentRequirementClasses({
  formik,
}: {
  formik: FormikProps<AdmissionDocumentRequirementPolicy>;
}) {
  const selected = formik.values.standardIds != null;
  const {
    data = [],
    isLoading,
    isError,
    refetch,
  } = useGetAdmissionDocumentClassesQuery(undefined, { skip: !selected });
  const ids = formik.values.standardIds ?? [];
  const missing = ids.filter((id) => !data.some((item) => item.id === id));
  const error = Boolean(formik.touched.standardIds && formik.errors.standardIds);
  return (
    <Stack spacing={1}>
      <CustomSelect
        size="small"
        fullWidth
        label="Applies to classes"
        value={selected ? 'selected' : 'all'}
        options={[
          { value: 'all', label: 'All classes' },
          { value: 'selected', label: 'Selected classes' },
        ]}
        onChange={(value) => formik.setFieldValue('standardIds', value === 'all' ? null : [])}
      />
      {selected && (
        <>
          <ShakingTextField error={error}>
            <CustomSelect
              size="small"
              fullWidth
              multiple
              isSearch
              label="Classes"
              value={ids}
              isLoading={isLoading}
              disabled={isError}
              options={[
                ...data.map((item) => ({
                  value: item.id,
                  label: `${item.name} — ${item.context}`,
                })),
                ...missing.map((id) => ({
                  value: id,
                  label: 'Unavailable class (remove or replace)',
                })),
              ]}
              onChange={(value) => formik.setFieldValue('standardIds', value)}
              onBlur={() => formik.setFieldTouched('standardIds')}
              error={error}
              helperText={
                error
                  ? String(formik.errors.standardIds)
                  : 'Uses the class selected for the Admission Offering. Additional conditions apply within these classes.'
              }
              noOptionsMessage="No classes are available. Add classes in Institute Setup."
            />
          </ShakingTextField>
          {isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Classes could not load. Your selection has been retained.
            </Alert>
          )}
          {!isLoading && !isError && missing.length > 0 && (
            <Alert severity="warning">
              A selected class is unavailable. Remove or replace it before publishing.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}
