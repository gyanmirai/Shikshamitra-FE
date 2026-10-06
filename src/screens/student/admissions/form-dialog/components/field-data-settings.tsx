import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { useGetAdmissionFormSystemFieldsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { configureStudentField, connectStudentAddressFields } from '../student-field-configuration';

import type { FieldSettingsProps } from '../types/field-settings';

export function FieldDataSettings({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const {
    data: systemFields,
    isLoading,
    isError,
    refetch,
  } = useGetAdmissionFormSystemFieldsQuery();
  const compatibleFields = (systemFields ?? []).filter(
    (item) => item.fieldType === field.fieldType
  );
  const selectedField = (systemFields ?? []).find((item) => item.key === field.bindingKey);
  const catalogueReady = systemFields !== undefined && !isLoading && !isError;
  const invalidMapping = Boolean(
    catalogueReady && field.bindingKey && selectedField?.fieldType !== field.fieldType
  );
  const retainedMapping = Boolean(
    field.bindingKey && !compatibleFields.some((item) => item.key === field.bindingKey)
  );
  const codeMeta = formik.getFieldMeta<string>(`${path}.code`);
  const codeError = Boolean(codeMeta.touched && codeMeta.error);
  return (
    <Stack spacing={1.5}>
      <ShakingTextField error={codeError}>
        <TextField
          fullWidth
          required
          size="small"
          label="Field code"
          name={`${path}.code`}
          value={field.code}
          error={codeError}
          onBlur={formik.handleBlur}
          helperText={
            codeError
              ? codeMeta.error
              : 'Unique reference used by form rules. Generated automatically.'
          }
          onChange={(event) => {
            const nextCode = event.target.value.toUpperCase();
            formik.setFieldValue(`${path}.code`, nextCode);
            if (field.bindingType === 1) formik.setFieldValue(`${path}.bindingKey`, nextCode);
          }}
        />
      </ShakingTextField>
      {field.fieldType !== 12 && (
        <>
          <CustomSelect
            size="small"
            label="Save answer to"
            value={field.bindingType}
            options={[
              { value: 0, label: 'Student record' },
              { value: 1, label: 'This admission form only' },
            ]}
            disabledValues={isLoading || isError || !compatibleFields.length ? [0] : []}
            disabledLabel={isLoading || isError ? 'Fields unavailable' : 'No compatible field'}
            helperText={
              catalogueReady && !compatibleFields.length
                ? 'No student record field supports this answer type. Save it in this admission form.'
                : undefined
            }
            onChange={(value) => {
              const nextBindingType = Number(value);
              formik.setFieldValue(`${path}.bindingType`, nextBindingType);
              formik.setFieldValue(
                `${path}.bindingKey`,
                nextBindingType === 1 ? field.code : undefined
              );
            }}
          />
          {field.bindingType === 0 && (
            <CustomSelect
              size="small"
              label="Student record field"
              value={field.bindingKey ?? ''}
              options={[
                { value: '', label: 'Select a student record field' },
                ...(retainedMapping
                  ? [
                      {
                        value: field.bindingKey!,
                        label: selectedField?.displayName ?? field.bindingKey!,
                      },
                    ]
                  : []),
                ...compatibleFields.map((item) => ({ value: item.key, label: item.displayName })),
              ]}
              disabledValues={retainedMapping ? [field.bindingKey!] : []}
              disabledLabel="Choose another field"
              isLoading={isLoading}
              disabled={isError}
              error={invalidMapping}
              helperText={
                invalidMapping
                  ? selectedField
                    ? 'The linked student record field does not match this answer type. Choose a compatible field.'
                    : 'The linked student record field is unavailable. Choose another field or save in this admission form.'
                  : selectedField?.destination === 'studentProfile'
                    ? 'Populates the Student profile for a new student. Changes to an existing student require review.'
                    : selectedField?.destination === 'capturedAdmissionDetails'
                      ? 'Retained in Captured admission details on the Student record.'
                      : 'The answer is linked to this field in the student record.'
              }
              onChange={(value) => {
                const selected = compatibleFields.find((item) => item.key === value);
                if (!selected) {
                  formik.setFieldValue(`${path}.bindingKey`, value || undefined);
                  return;
                }
                const nextField = configureStudentField(field, selected);
                const allFields = formik.values.sections.flatMap((section) =>
                  section.fields.map((item) => (item.id === field.id ? nextField : item))
                );
                const connected = connectStudentAddressFields(allFields);
                formik.setFieldValue(
                  path,
                  connected.find((item) => item.id === field.id) ?? nextField
                );
              }}
            />
          )}
          {isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load student record fields.
            </Alert>
          )}
        </>
      )}
    </Stack>
  );
}
