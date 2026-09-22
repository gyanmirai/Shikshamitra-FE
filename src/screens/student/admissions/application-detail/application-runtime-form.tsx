import type {
  AdmissionApplication,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useLazyGetAdmissionFormOptionsQuery } from 'src/redux/student/admissions/admission-forms-api';
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
  MobileStepper,
  useMediaQuery,
} from '@mui/material';

import AdmissionRuntimeField from '../admission-runtime-field';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { getDependentAdmissionFieldCodes } from '../admission-field-dependencies';
import { localizeAdmissionSection, getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import {
  parseRuntimeOptionsSource,
  resolveRuntimeOptionsJson,
} from './application-runtime-options';
import {
  readRepeatableValues,
  writeRepeatableValue,
  removeRepeatableEntry,
  getRepeatableEntryCount,
} from '../form-repeatable-values';

type Props = {
  application: AdmissionApplication;
  form: AdmissionApplicationForm;
  values: Record<string, string>;
  errors: string[];
  fieldErrors: Record<string, string>;
  saving: boolean;
  submitting: boolean;
  onChange: (fieldCode: string, value: string) => void;
  onBlur: (fieldCode: string) => void;
  onSave: () => Promise<void>;
  onValidateStep: (sectionId: string) => boolean;
  onSubmit: () => void;
  showSaveDraft: boolean;
  canSubmitForm: boolean;
  managedFormStage: boolean;
  canReopen: boolean;
  reopening: boolean;
  onReopen: () => void;
};

export function ApplicationRuntimeForm({
  application,
  form,
  values,
  errors,
  fieldErrors,
  saving,
  submitting,
  onChange,
  onBlur,
  onSave,
  onValidateStep,
  onSubmit,
  showSaveDraft,
  canSubmitForm,
  managedFormStage,
  canReopen,
  reopening,
  onReopen,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fieldsPerRow = form.definition.fieldsPerRow ?? 1;
  const [activeStep, setActiveStep] = useState(0);
  const [language, setLanguage] = useState(form.definition.defaultLanguage ?? 'en');
  const supportedLanguages = form.definition.supportedLanguages?.length
    ? form.definition.supportedLanguages
    : [form.definition.defaultLanguage ?? 'en'];
  const [loadOptions] = useLazyGetAdmissionFormOptionsQuery();
  const [resolvedOptions, setResolvedOptions] = useState<Record<string, string>>({});
  const localizedSections = useMemo(
    () => form.definition.sections.map((section) => localizeAdmissionSection(section, language)),
    [form.definition.sections, language]
  );
  const visibleSections = useMemo(
    () =>
      localizedSections.filter((section) =>
        isAdmissionRuleVisible(section.visibilityRuleJson, values)
      ),
    [localizedSections, values]
  );
  const isStepper = form.definition.layoutType === 1;
  const visibleSteps = getAdmissionFormStepGroups(localizedSections)
    .filter((step) => isAdmissionRuleVisible(step.visibilityRuleJson, values))
    .map((step) => ({
      ...step,
      sections: step.sections.filter(({ section }) => visibleSections.includes(section)),
    }))
    .filter((step) => step.sections.length > 0);
  const currentSections = isStepper
    ? (visibleSteps[activeStep]?.sections.map(({ section }) => section) ?? [])
    : visibleSections;
  const fields = useMemo(
    () => localizedSections.flatMap((section) => section.fields),
    [localizedSections]
  );
  const updateField = (code: string, value: string) => {
    onChange(code, value);
    getDependentAdmissionFieldCodes(fields, code).forEach((dependentCode) =>
      onChange(dependentCode, '')
    );
  };
  const optionRequests = useMemo<RuntimeOptionRequest[]>(
    () =>
      localizedSections
        .flatMap((section) => section.fields)
        .reduce<RuntimeOptionRequest[]>((requests, field) => {
          const source = parseRuntimeOptionsSource(field.optionsJson);
          if (source)
            requests.push({
              code: field.code,
              sourceKey: source.source,
              parentId: source.parentField ? values[source.parentField] : undefined,
              academicYearId: form.academicYearId,
            });
          return requests;
        }, []),
    [form.academicYearId, localizedSections, values]
  );
  const optionRequestKey = JSON.stringify(optionRequests);
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      optionRequests.map(async (request) => {
        try {
          const options = await loadOptions({
            sourceKey: request.sourceKey,
            parentId: request.parentId,
            academicYearId: request.academicYearId,
          }).unwrap();
          return [
            request.code,
            JSON.stringify(options.filter((option) => option.isActive)),
          ] as const;
        } catch {
          return [request.code, '[]'] as const;
        }
      })
    ).then((entries) => {
      if (!cancelled) setResolvedOptions(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
    // The request key is intentionally derived from the fields and parent values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionRequestKey]);
  const moveToNextStep = (alreadyValidated = false) => {
    if (
      !currentSections.length ||
      (!alreadyValidated && !currentSections.every((section) => onValidateStep(section.id)))
    )
      return;
    setActiveStep((step) => Math.min(step + 1, visibleSteps.length - 1));
  };

  const renderSectionFields = (
    section: (typeof localizedSections)[number],
    entryIndex?: number
  ) => {
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
    return section.fields
      .filter((field) => isAdmissionRuleVisible(field.visibilityRuleJson, rowValues))
      .map((field) => {
        const value =
          entryIndex === undefined
            ? (values[field.code] ?? '')
            : (readRepeatableValues(values[field.code])[entryIndex] ?? '');
        return (
          <Grid key={field.code} size={{ xs: 12, sm: 12 / fieldsPerRow }}>
            <AdmissionRuntimeField
              field={{
                ...field,
                optionsJson: resolveRuntimeOptionsJson({
                  configuredOptionsJson: field.optionsJson,
                  resolvedOptionsJson: resolvedOptions[field.code],
                  currentValue: value,
                  multiple: field.fieldType === 7,
                }),
              }}
              value={value}
              disabled={field.readOnly || application.status !== 0}
              error={
                fieldErrors[`${field.code}[${entryIndex}]`] || fieldErrors[field.code]
                  ? field.translations?.[language]?.validationMessage ||
                    fieldErrors[`${field.code}[${entryIndex}]`] ||
                    fieldErrors[field.code]
                  : undefined
              }
              onBlur={() => onBlur(field.code)}
              formValues={rowValues}
              onChange={(nextValue) =>
                entryIndex === undefined
                  ? updateField(field.code, nextValue)
                  : onChange(
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
          {renderSectionFields(section)}
        </SectionCard>
      );

    const count = getRepeatableEntryCount(
      section.fields.map((field) => values[field.code]),
      section.minEntries
    );
    const entryLabel = section.entryLabel || section.name.replace(/s$/i, '') || 'Entry';
    const maxEntries = section.maxEntries ?? 1;
    return (
      <Stack key={section.id} spacing={1.5}>
        <Typography variant="subtitle1">{section.name}</Typography>
        {Array.from({ length: count }, (_, entryIndex) => (
          <SectionCard
            key={`${section.id}-${entryIndex}`}
            title={`${entryLabel} ${entryIndex + 1}`}
            gridProps={{ spacing: 1 }}
          >
            {renderSectionFields(section, entryIndex)}
            {count > Math.max(section.minEntries ?? 0, 1) && application.status === 0 && (
              <Grid size={{ xs: 12 }}>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  onClick={() =>
                    section.fields.forEach((field) =>
                      onChange(field.code, removeRepeatableEntry(values[field.code], entryIndex))
                    )
                  }
                >
                  Remove {entryLabel.toLowerCase()}
                </Button>
              </Grid>
            )}
          </SectionCard>
        ))}
        {count < maxEntries && application.status === 0 && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={() =>
              section.fields.forEach((field) =>
                onChange(field.code, writeRepeatableValue(values[field.code], count, ''))
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
    <>
      {errors.map((error) => (
        <Alert severity="error" key={error}>
          {error}
        </Alert>
      ))}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {form.definition.name} · v{form.formVersion}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            {form.status === 1 ? 'Submitted' : form.status === 2 ? 'Reopened' : 'Draft'}
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
          {isStepper &&
            visibleSteps.length > 0 &&
            (isMobile ? (
              <MobileStepper
                variant="dots"
                steps={visibleSteps.length}
                position="static"
                activeStep={activeStep}
                sx={{ p: 0, mb: 2 }}
                nextButton={<span />}
                backButton={<span />}
              />
            ) : (
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {visibleSteps.map((step) => (
                  <Step key={step.id}>
                    <StepLabel>{step.name}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            ))}
          <Stack spacing={2}>
            {isStepper ? (
              currentSections.length ? (
                currentSections.map(renderSection)
              ) : (
                <Typography color="text.secondary">No visible sections are available.</Typography>
              )
            ) : (
              visibleSections.map(renderSection)
            )}
          </Stack>
          {isStepper && visibleSteps.length > 1 && (
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Step {activeStep + 1} of {visibleSteps.length}
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Button
                  size="small"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((step) => step - 1)}
                >
                  Previous
                </Button>
                <Stack direction="row" spacing={1}>
                  {showSaveDraft && (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={saving || application.status !== 0}
                      onClick={async () => {
                        if (currentSections.every((section) => onValidateStep(section.id))) {
                          await onSave();
                          moveToNextStep(true);
                        }
                      }}
                    >
                      Save &amp; continue
                    </Button>
                  )}
                  <Button
                    size="small"
                    disabled={activeStep === visibleSteps.length - 1}
                    onClick={() => moveToNextStep()}
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 3 }}>
            {showSaveDraft && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:content-save-outline" />}
                disabled={saving || application.status !== 0}
                onClick={onSave}
              >
                Save draft
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:send-outline" />}
              disabled={submitting || application.status !== 0 || !canSubmitForm}
              onClick={onSubmit}
            >
              Submit application
            </Button>
            {application.status === 1 && canReopen && !managedFormStage && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:lock-open-outline" />}
                disabled={reopening}
                onClick={onReopen}
              >
                Reopen form
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
}

type RuntimeOptionRequest = {
  code: string;
  sourceKey: string;
  parentId?: string;
  academicYearId: string;
};
