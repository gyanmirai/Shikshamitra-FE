import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Card,
  Grid,
  Step,
  Alert,
  Stack,
  Button,
  Stepper,
  StepLabel,
  Typography,
  CardContent,
} from '@mui/material';

import AdmissionRuntimeField from '../admission-runtime-field';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { getDependentAdmissionFieldCodes } from '../admission-field-dependencies';
import { getDynamicAdmissionValidationErrors } from '../admission-form-validation';
import { localizeAdmissionSection, getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import {
  readRepeatableValues,
  writeRepeatableValue,
  removeRepeatableEntry,
  getRepeatableEntryCount,
} from '../form-repeatable-values';

type Props = {
  form: AdmissionForm;
  formik: FormikProps<Record<string, string>>;
  resolvedOptions: Record<string, string>;
};

export function FormPreviewContent({ form, formik, resolvedOptions }: Props) {
  const fieldsPerRow = form.fieldsPerRow ?? 1;
  const { values } = formik;
  const [activeStep, setActiveStep] = useState(0);
  const [language, setLanguage] = useState(form.defaultLanguage ?? 'en');
  const supportedLanguages = form.supportedLanguages?.length
    ? form.supportedLanguages
    : [form.defaultLanguage ?? 'en'];
  const localizedSections = useMemo(
    () => form.sections.map((section) => localizeAdmissionSection(section, language)),
    [form.sections, language]
  );
  const fields = localizedSections.flatMap((section) => section.fields);
  const visibleSections = localizedSections.filter((section) =>
    isAdmissionRuleVisible(section.visibilityRuleJson, values)
  );
  const isStepper = form.layoutType === 1;
  const visibleSteps = getAdmissionFormStepGroups(localizedSections)
    .filter((step) => isAdmissionRuleVisible(step.visibilityRuleJson, values))
    .map((step) => ({
      ...step,
      sections: step.sections.filter(({ section }) => visibleSections.includes(section)),
    }))
    .filter((step) => step.sections.length > 0);
  const safeActiveStep = Math.min(activeStep, Math.max(visibleSteps.length - 1, 0));
  const sectionsToRender = isStepper
    ? (visibleSteps[safeActiveStep]?.sections.map(({ section }) => section) ?? [])
    : visibleSections;
  const updateField = (code: string, value: string) => {
    formik.setFieldValue(code, value).catch(() => undefined);
    getDependentAdmissionFieldCodes(fields, code).forEach((dependentCode) => {
      formik.setFieldValue(dependentCode, '').catch(() => undefined);
    });
  };
  const renderFields = (section: (typeof localizedSections)[number], entryIndex?: number) => {
    const rowValues =
      entryIndex === undefined
        ? values
        : {
            ...values,
            ...Object.fromEntries(
              section.fields.map((field) => [
                field.code,
                readRepeatableValues(values[field.code])[entryIndex] ?? '',
              ])
            ),
          };
    const visibleFields = section.fields.filter((field) =>
      isAdmissionRuleVisible(field.visibilityRuleJson, rowValues)
    );
    if (!visibleFields.length)
      return (
        <Grid size={{ xs: 12 }}>
          <Alert severity="info">No fields are configured for this section yet.</Alert>
        </Grid>
      );
    return visibleFields.map((field) => {
      const value =
        entryIndex === undefined
          ? (values[field.code] ?? '')
          : (readRepeatableValues(values[field.code])[entryIndex] ?? '');
      return (
        <Grid key={field.code} size={{ xs: 12, sm: 12 / fieldsPerRow }}>
          <AdmissionRuntimeField
            field={{
              ...field,
              optionsJson: resolvedOptions[field.code] ?? field.optionsJson,
            }}
            value={value}
            disabled={field.readOnly}
            error={
              formik.touched[field.code] && typeof formik.errors[field.code] === 'string'
                ? field.translations?.[language]?.validationMessage || formik.errors[field.code]
                : undefined
            }
            onBlur={() => formik.setFieldTouched(field.code, true).catch(() => undefined)}
            formValues={rowValues}
            onChange={(nextValue) =>
              entryIndex === undefined
                ? updateField(field.code, nextValue)
                : updateField(
                    field.code,
                    writeRepeatableValue(values[field.code], entryIndex, nextValue)
                  )
            }
          />
        </Grid>
      );
    });
  };
  const renderSection = (section: (typeof localizedSections)[number]) => {
    if (!section.isRepeatable)
      return (
        <SectionCard key={section.id} title={section.name} gridProps={{ spacing: 1 }}>
          {renderFields(section)}
        </SectionCard>
      );
    const count = getRepeatableEntryCount(
      section.fields.map((field) => values[field.code]),
      section.minEntries
    );
    const entryLabel = section.entryLabel || section.name.replace(/s$/i, '') || 'Entry';
    return (
      <Stack key={section.id} spacing={1.5}>
        <Typography variant="subtitle1">{section.name}</Typography>
        {Array.from({ length: count }, (_, entryIndex) => (
          <SectionCard
            key={`${section.id}-${entryIndex}`}
            title={`${entryLabel} ${entryIndex + 1}`}
            gridProps={{ spacing: 1 }}
          >
            {renderFields(section, entryIndex)}
            {count > Math.max(section.minEntries ?? 0, 1) && (
              <Grid size={{ xs: 12 }}>
                <Button
                  size="small"
                  color="error"
                  onClick={() =>
                    section.fields.forEach((field) =>
                      updateField(field.code, removeRepeatableEntry(values[field.code], entryIndex))
                    )
                  }
                >
                  Remove {entryLabel.toLowerCase()}
                </Button>
              </Grid>
            )}
          </SectionCard>
        ))}
        {count < (section.maxEntries ?? 1) && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() =>
              section.fields.forEach((field) =>
                updateField(field.code, writeRepeatableValue(values[field.code], count, ''))
              )
            }
            sx={{ alignSelf: 'flex-start' }}
          >
            Add {entryLabel.toLowerCase()}
          </Button>
        )}
      </Stack>
    );
  };

  return (
    <Card component="form" onSubmit={formik.handleSubmit}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {form.name} · v{form.version}
        </Typography>
        {supportedLanguages.length > 1 && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
            <CustomSelect
              size="small"
              label="Form language"
              value={language}
              options={supportedLanguages.map((code) => ({
                value: code,
                label: getAdmissionLanguageLabel(code),
              }))}
              onChange={(value) => setLanguage(String(value))}
              sx={{ width: { xs: 1, sm: 220 } }}
            />
          </Stack>
        )}
        {isStepper && visibleSteps.length > 0 && (
          <Stepper activeStep={safeActiveStep} alternativeLabel sx={{ mb: 3 }}>
            {visibleSteps.map((step) => (
              <Step key={step.id}>
                <StepLabel>{step.name}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        <Stack spacing={2}>{sectionsToRender.map(renderSection)}</Stack>
        {isStepper && visibleSteps.length > 1 && (
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button
              size="small"
              type="button"
              variant="outlined"
              disabled={safeActiveStep === 0}
              onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
            >
              Previous
            </Button>
            <Button
              size="small"
              type="button"
              variant="outlined"
              disabled={safeActiveStep === visibleSteps.length - 1}
              onClick={() => setActiveStep((step) => Math.min(step + 1, visibleSteps.length - 1))}
            >
              Next
            </Button>
          </Stack>
        )}
        {Object.values(formik.errors)
          .filter((error): error is string => typeof error === 'string')
          .map((error) => (
            <Alert severity="error" key={error} sx={{ mt: 2 }}>
              {error}
            </Alert>
          ))}
        <Button size="small" type="submit" variant="contained" sx={{ mt: 3 }}>
          Validate preview
        </Button>
      </CardContent>
    </Card>
  );
}

export function getPreviewErrors(form: AdmissionForm, values: Record<string, string>) {
  return Object.values(getDynamicAdmissionValidationErrors(form, values)).filter(
    (error): error is string => typeof error === 'string'
  );
}
