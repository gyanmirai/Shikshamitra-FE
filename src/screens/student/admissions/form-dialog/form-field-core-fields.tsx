import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CustomSelect from 'src/components/custom-select';
import FormControlLabel from '@mui/material/FormControlLabel';
import ShakingTextField from 'src/components/shaking-text-field';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetAdmissionFormSystemFieldsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { parseFieldConfiguration } from './form-field-presets';
import { FieldChoiceSettings } from './components/field-choice-settings';
import { FIELD_TYPES, getConfigurableFieldTypes } from './form-dialog-model';
import { FieldTranslationSettings } from './components/field-translation-settings';
import {
  classInterestOptions,
  isClassInterestQuestion,
  classInterestConfigurationValid,
} from '../admission-class-question';

import type { FieldSettingsProps } from './types/field-settings';

export function FormFieldCoreFields({ formik, sectionIndex, fieldIndex }: FieldSettingsProps) {
  const field = formik.values.sections[sectionIndex].fields[fieldIndex];
  const path = `sections[${sectionIndex}].fields[${fieldIndex}]`;
  const isChoice = field.fieldType === 6 || field.fieldType === 7 || field.fieldType === 8;
  const isStatic = field.fieldType === 12;
  const isLinked = field.bindingType === 0;
  const isClassInterest = isClassInterestQuestion(field);
  const needsClassRepair = isClassInterest && !classInterestConfigurationValid(field);
  const catalogue = useGetAdmissionFormSystemFieldsQuery(undefined, { skip: !isLinked });
  const catalogueReady = catalogue.data !== undefined && !catalogue.isLoading && !catalogue.isError;
  const linkedField = catalogueReady
    ? catalogue.data?.find((item) => item.key.toLowerCase() === field.bindingKey?.toLowerCase())
    : undefined;
  const expectedType = FIELD_TYPES.find(([, type]) => type === linkedField?.fieldType)?.[0];
  const needsTypeRepair = Boolean(linkedField && linkedField.fieldType !== field.fieldType);
  const labelMeta = formik.getFieldMeta<string>(`${path}.label`);
  const labelError = Boolean(labelMeta.touched && labelMeta.error);
  return (
    <Stack spacing={1.5}>
      <SectionCard
        title="Basic settings"
        paperProps={{ sx: { mb: 0, minWidth: 0 } }}
        gridProps={{ sx: { display: 'block' } }}
      >
        <Stack spacing={1.5}>
          <ShakingTextField error={labelError}>
            <TextField
              fullWidth
              required
              size="small"
              label="Field label"
              value={field.label}
              name={`${path}.label`}
              onBlur={formik.handleBlur}
              error={labelError}
              onChange={(event) => formik.setFieldValue(`${path}.label`, event.target.value)}
              helperText={labelError ? labelMeta.error : ''}
            />
          </ShakingTextField>
          <CustomSelect
            size="small"
            label="Field type"
            value={field.fieldType}
            options={getConfigurableFieldTypes(field.fieldType).map(([label, value]) => ({
              label,
              value,
            }))}
            disabled={isLinked || isClassInterest || field.fieldType === 10}
            error={
              needsClassRepair ||
              needsTypeRepair ||
              Boolean(isLinked && catalogueReady && !linkedField)
            }
            helperText={
              isClassInterest
                ? 'Class choices come from Institute Setup.'
                : isLinked
                  ? catalogue.isError
                    ? 'Could not check this student field connection. Reload the form and try again.'
                    : !catalogueReady
                      ? 'Checking the linked student field.'
                      : linkedField
                        ? `Linked to ${linkedField.displayName}. This student field uses ${expectedType}. For a different answer type, add a custom field.`
                        : 'This student field connection is unavailable. Review this field before publishing.'
                  : field.fieldType === 10
                    ? 'File upload is not available yet. Replace this field before publishing.'
                    : undefined
            }
            onChange={(value) => formik.setFieldValue(`${path}.fieldType`, Number(value))}
          />
          {needsClassRepair && (
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={() =>
                formik.setFieldValue(path, {
                  ...field,
                  fieldType: 6,
                  optionsJson: classInterestOptions,
                })
              }
            >
              Use Institute Setup classes
            </Button>
          )}
          {needsTypeRepair && linkedField && (
            <Button
              type="button"
              size="small"
              variant="outlined"
              onClick={() =>
                formik.setFieldValue(path, {
                  ...field,
                  fieldType: linkedField.fieldType,
                  optionsJson: linkedField.optionsJson,
                  ...(linkedField.validationJson
                    ? {
                        validationJson: JSON.stringify({
                          ...parseFieldConfiguration(field.validationJson),
                          ...parseFieldConfiguration(linkedField.validationJson),
                        }),
                      }
                    : {}),
                })
              }
            >
              Restore {expectedType}
            </Button>
          )}
          {!isStatic && (
            <FormControlLabel
              labelPlacement="start"
              sx={{
                m: 0,
                justifyContent: 'space-between',
                gap: 1,
              }}
              control={
                <Switch
                  size="small"
                  checked={field.required}
                  onChange={(event) =>
                    formik.setFieldValue(`${path}.required`, event.target.checked)
                  }
                />
              }
              label={
                <Stack>
                  <Typography variant="body2" fontWeight={600}>
                    Required field
                  </Typography>
                </Stack>
              }
            />
          )}
          <TextField
            fullWidth
            size="small"
            label="Help text (optional)"
            value={field.helpText ?? ''}
            multiline
            minRows={2}
            onChange={(event) =>
              formik.setFieldValue(`${path}.helpText`, event.target.value || undefined)
            }
          />
        </Stack>
      </SectionCard>
      {isChoice && (
        <FieldChoiceSettings formik={formik} sectionIndex={sectionIndex} fieldIndex={fieldIndex} />
      )}
      <FieldTranslationSettings
        formik={formik}
        sectionIndex={sectionIndex}
        fieldIndex={fieldIndex}
      />
    </Stack>
  );
}
