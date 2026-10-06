import type { FormikProps } from 'formik';
import type { KeyboardEvent } from 'react';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Card, Grid, Alert, Stack, Button, Typography, CardContent } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import AdmissionRuntimeField from '../admission-runtime-field';
import { useAdmissionPhotoReads } from '../use-admission-photo-reads';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { getDependentAdmissionFieldCodes } from '../admission-field-dependencies';
import { getDynamicAdmissionValidationErrors } from '../admission-form-validation';
import { AdmissionFormStepNavigation } from '../components/admission-form-step-navigation';
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
  embedded?: boolean;
};

export function FormPreviewContent({ form, formik, resolvedOptions, embedded = false }: Props) {
  const fieldsPerRow = form.fieldsPerRow ?? 1;
  const { values } = formik;
  const [activeStep, setActiveStep] = useState(0);
  const { readingPhoto, onPhotoReading } = useAdmissionPhotoReads();
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
        <Grid
          key={field.code}
          size={{
            xs: 12,
            sm: field.fieldType === 1 ? 12 : 12 / Math.min(fieldsPerRow, 2),
            lg: field.fieldType === 1 ? 12 : 12 / fieldsPerRow,
          }}
        >
          <AdmissionRuntimeField
            field={{
              ...field,
              optionsJson: resolvedOptions[field.code] ?? field.optionsJson,
            }}
            value={value}
            disabled={field.readOnly || readingPhoto}
            error={
              formik.touched[field.code] && typeof formik.errors[field.code] === 'string'
                ? field.translations?.[language]?.validationMessage || formik.errors[field.code]
                : undefined
            }
            onBlur={() => formik.setFieldTouched(field.code, true).catch(() => undefined)}
            onBusyChange={(busy) => onPhotoReading(`${field.code}[${entryIndex ?? 0}]`, busy)}
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
                  disabled={readingPhoto}
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
            disabled={readingPhoto}
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
    <Card
      component={embedded ? 'div' : 'form'}
      onSubmit={embedded ? undefined : formik.handleSubmit}
      onKeyDownCapture={(event: KeyboardEvent<HTMLElement>) => {
        if (
          embedded &&
          event.key === 'Enter' &&
          event.target instanceof HTMLInputElement &&
          event.target.getAttribute('role') !== 'combobox'
        ) {
          event.preventDefault();
          if (!readingPhoto) formik.submitForm();
        }
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {form.name} · v{form.version}
        </Typography>
        {supportedLanguages.length > 1 && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
            <CustomSelect
              size="small"
              label="Form language"
              disabled={readingPhoto}
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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
          {isStepper && visibleSteps.length > 0 && (
            <Stack sx={{ width: { xs: 1, md: 220 }, flexShrink: 0, minWidth: 0 }}>
              <AdmissionFormStepNavigation
                activeStep={safeActiveStep}
                disabled={readingPhoto}
                steps={visibleSteps.map((step) => ({ id: step.id, name: step.name }))}
                onStepChange={setActiveStep}
              />
            </Stack>
          )}
          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            {sectionsToRender.map(renderSection)}
          </Stack>
        </Stack>
        {isStepper && visibleSteps.length > 1 && (
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
            <Button
              size="small"
              type="button"
              variant="outlined"
              disabled={readingPhoto || safeActiveStep === 0}
              onClick={() => setActiveStep(Math.max(safeActiveStep - 1, 0))}
            >
              Previous
            </Button>
            <Button
              size="small"
              type="button"
              variant="outlined"
              disabled={readingPhoto || safeActiveStep === visibleSteps.length - 1}
              onClick={() => setActiveStep(Math.min(safeActiveStep + 1, visibleSteps.length - 1))}
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
        <Button
          size="small"
          type={embedded ? 'button' : 'submit'}
          variant="contained"
          disabled={readingPhoto}
          onClick={embedded ? () => formik.submitForm() : undefined}
          sx={{ mt: 3 }}
        >
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
