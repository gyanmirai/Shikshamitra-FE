import type { ReactNode } from 'react';
import type {
  AdmissionApplication,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomStepper from 'src/components/custom-stepper';
import { LoadingButton } from 'src/components/loading-button';
import { Box, Grid, Alert, Stack, Button, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useLazyGetAdmissionFormOptionsQuery } from 'src/redux/student/admissions/admission-forms-api';

import AdmissionRuntimeField from '../admission-runtime-field';
import { useAdmissionPhotoReads } from '../use-admission-photo-reads';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { getDependentAdmissionFieldCodes } from '../admission-field-dependencies';
import { AdmissionFormStepNavigation } from '../components/admission-form-step-navigation';
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
  onSave: () => Promise<boolean>;
  onValidateStep: (sectionId: string) => boolean;
  onSubmit: () => void;
  showSaveDraft: boolean;
  canSubmitForm: boolean;
  managedFormStage: boolean;
  canReopen: boolean;
  reopening: boolean;
  onReopen: () => void;
  documents?: ReactNode;
  beforeActions?: ReactNode;
  compact?: boolean;
  readOnly?: boolean;
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
  documents,
  beforeActions,
  compact = false,
  readOnly = false,
}: Props) {
  const fieldsPerRow = form.definition.fieldsPerRow ?? 1;
  const [activeStep, setActiveStep] = useState(0);
  const [savingStep, setSavingStep] = useState(false);
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
  const safeActiveStep = Math.min(activeStep, Math.max(0, visibleSteps.length - 1));
  const { readingPhoto, onPhotoReading } = useAdmissionPhotoReads();
  const interactionLocked = saving || submitting || reopening || readingPhoto || savingStep;
  const isLastStep =
    !isStepper || visibleSteps.length === 0 || safeActiveStep === visibleSteps.length - 1;
  const canEditForm = !readOnly && application.status === 0;
  const currentSections = isStepper
    ? (visibleSteps[safeActiveStep]?.sections.map(({ section }) => section) ?? [])
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
          if (source && source.source !== 'StudentSiblings')
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
      (!readOnly &&
        !alreadyValidated &&
        !currentSections.every((section) => onValidateStep(section.id)))
    )
      return;
    setActiveStep(Math.min(safeActiveStep + 1, visibleSteps.length - 1));
  };
  const saveAndContinue = async () => {
    if (interactionLocked) return;
    if (!currentSections.every((section) => onValidateStep(section.id))) return;
    setSavingStep(true);
    try {
      const saved = await onSave();
      if (saved) moveToNextStep(true);
    } finally {
      setSavingStep(false);
    }
  };

  const renderSectionFields = (
    section: (typeof localizedSections)[number],
    entryIndex?: number,
    fieldsToRender = section.fields
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
    return fieldsToRender
      .filter((field) => isAdmissionRuleVisible(field.visibilityRuleJson, rowValues))
      .map((field) => {
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
                optionsJson: resolveRuntimeOptionsJson({
                  configuredOptionsJson: field.optionsJson,
                  resolvedOptionsJson: resolvedOptions[field.code],
                  currentValue: value,
                  multiple: field.fieldType === 7,
                }),
              }}
              value={value}
              disabled={interactionLocked || readOnly || field.readOnly || application.status !== 0}
              error={
                fieldErrors[`${field.code}[${entryIndex}]`] || fieldErrors[field.code]
                  ? field.translations?.[language]?.validationMessage ||
                    fieldErrors[`${field.code}[${entryIndex}]`] ||
                    fieldErrors[field.code]
                  : undefined
              }
              onBlur={() => onBlur(field.code)}
              onBusyChange={(busy) => onPhotoReading(`${field.code}[${entryIndex ?? 0}]`, busy)}
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
    if (!section.isRepeatable) {
      const splitStudentDetails =
        form.definition.sections.some(
          (configured) =>
            configured.id === section.id && configured.name.toLowerCase() === 'student details'
        ) && section.fields.length >= 10;
      const groups = splitStudentDetails
        ? groupStudentDetailFields(
            section.fields.filter((field) =>
              isAdmissionRuleVisible(field.visibilityRuleJson, values)
            )
          )
        : [];
      return (
        <Box key={section.id} sx={{ width: 1 }}>
          {groups.length ? (
            <Stack spacing={compact ? 1.5 : 2}>
              {groups.map((group) => (
                <SectionCard
                  key={group.name}
                  title={group.name}
                  gridProps={{ spacing: compact ? 1 : 2 }}
                  paperProps={{
                    sx: {
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' },
                      ...(compact && { p: 1.5 }),
                    },
                  }}
                >
                  {renderSectionFields(section, undefined, group.fields)}
                </SectionCard>
              ))}
            </Stack>
          ) : (
            <SectionCard
              title={section.name}
              gridProps={{ spacing: compact ? 1 : 2 }}
              paperProps={{
                sx: {
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                  ...(compact && { p: 1.5 }),
                },
              }}
            >
              {renderSectionFields(section)}
            </SectionCard>
          )}
        </Box>
      );
    }

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
            gridProps={{ spacing: compact ? 1 : 2 }}
            paperProps={
              compact
                ? { sx: { p: 1.5, boxShadow: 'none', '&:hover': { boxShadow: 'none' } } }
                : undefined
            }
          >
            {renderSectionFields(section, entryIndex)}
            {count > Math.max(section.minEntries ?? 0, 1) &&
              application.status === 0 &&
              !readOnly && (
                <Grid size={{ xs: 12 }}>
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    disabled={interactionLocked}
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
        {count < maxEntries && application.status === 0 && !readOnly && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            disabled={interactionLocked}
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
      <Box sx={{ width: 1 }}>
        <Box sx={compact ? { width: 1 } : { maxWidth: 1280, mx: 'auto' }}>
          {!compact && (
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {form.definition.name} · v{form.formVersion}
            </Typography>
          )}
          {compact && isStepper && visibleSteps.length > 0 && (
            <Box
              component="nav"
              aria-label="Form steps"
              sx={{
                width: 1,
                minWidth: 0,
                py: 1,
                mb: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiStepper-root': { minWidth: visibleSteps.length * 44 },
                '& .MuiStep-root': { px: 0, minWidth: 0, flex: 1 },
                '& .MuiStepButton-root': { p: 0.5, minHeight: 44 },
                '& .MuiStepConnector-root': { top: 18 },
                '& .MuiStepLabel-label': {
                  typography: 'caption',
                  mt: '4px !important',
                  position: { xs: 'absolute', sm: 'static' },
                  width: { xs: 1, sm: 'auto' },
                  height: { xs: 1, sm: 'auto' },
                  overflow: { xs: 'hidden', sm: 'visible' },
                  clipPath: { xs: 'inset(50%)', sm: 'none' },
                },
                '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': {
                  color: 'primary.main',
                },
              }}
            >
              <Scrollbar sx={{ flexGrow: 0 }}>
                <CustomStepper
                  ariaLabel="Application form sections"
                  steps={visibleSteps.map((step) => step.name)}
                  activeStep={safeActiveStep}
                  stepStates={visibleSteps.map(() => (form.status === 1 ? 'completed' : 'pending'))}
                  disabled={interactionLocked}
                  onStepClick={setActiveStep}
                />
              </Scrollbar>
              <Typography
                variant="caption"
                sx={{ display: { xs: 'block', sm: 'none' }, textAlign: 'center', mt: 0.5 }}
              >
                {visibleSteps[safeActiveStep]?.name}
              </Typography>
            </Box>
          )}
          {!compact && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              {form.status === 1 ? 'Submitted' : form.status === 2 ? 'Reopened' : 'Draft'}
            </Typography>
          )}
          {supportedLanguages.length > 1 && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
              <CustomSelect
                size="small"
                label="Form language"
                disabled={interactionLocked}
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
          <Stack
            direction={compact ? 'column' : { xs: 'column', md: 'row' }}
            spacing={compact ? 1.5 : 3}
            alignItems="stretch"
          >
            {!compact && isStepper && visibleSteps.length > 0 && (
              <Box sx={{ width: compact ? 1 : { xs: 1, md: 220 }, flexShrink: 0, minWidth: 0 }}>
                <AdmissionFormStepNavigation
                  activeStep={safeActiveStep}
                  steps={visibleSteps.map((step) => ({ id: step.id, name: step.name }))}
                  disabled={interactionLocked}
                  orientation={compact ? 'horizontal' : 'responsive'}
                  compact={compact}
                  completedSteps={form.status === 1 ? visibleSteps.map((_, index) => index) : []}
                  onStepChange={(index) => {
                    if (
                      index <= safeActiveStep ||
                      readOnly ||
                      application.status !== 0 ||
                      visibleSteps
                        .slice(safeActiveStep, index)
                        .every((step) =>
                          step.sections.every(({ section }) => onValidateStep(section.id))
                        )
                    )
                      setActiveStep(index);
                  }}
                />
              </Box>
            )}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
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
          </Stack>
          {documents && (!isStepper || safeActiveStep === visibleSteps.length - 1) && (
            <Stack sx={{ mt: 2 }}>{documents}</Stack>
          )}
          {beforeActions && <Box sx={{ mt: 1.5 }}>{beforeActions}</Box>}
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            justifyContent="flex-end"
            sx={{
              mt: compact ? 1.5 : 3,
              pt: compact ? 1 : 2,
              borderTop: 1,
              borderColor: 'divider',
              ...(compact && {
                position: 'sticky',
                bottom: 0,
                bgcolor: 'background.paper',
                py: 1,
                zIndex: 1,
              }),
            }}
          >
            {isStepper && visibleSteps.length > 1 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:arrow-left" width={16} />}
                disabled={interactionLocked || safeActiveStep === 0}
                onClick={() => setActiveStep(Math.max(safeActiveStep - 1, 0))}
                sx={{ mr: 'auto' }}
              >
                Previous
              </Button>
            )}
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
              {showSaveDraft && canEditForm && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
                  loading={saving && !savingStep && !submitting}
                  disabled={interactionLocked}
                  onClick={onSave}
                >
                  Save
                </LoadingButton>
              )}
              {!isLastStep && (
                <LoadingButton
                  size="small"
                  variant={canEditForm ? 'contained' : 'outlined'}
                  endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                  loading={savingStep}
                  disabled={interactionLocked}
                  onClick={canEditForm && showSaveDraft ? saveAndContinue : () => moveToNextStep()}
                >
                  {canEditForm && showSaveDraft ? 'Save & Next' : 'Next'}
                </LoadingButton>
              )}
              {isLastStep && canEditForm && (
                <LoadingButton
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="mdi:send-outline" width={16} />}
                  loading={submitting}
                  disabled={interactionLocked || !canSubmitForm}
                  onClick={onSubmit}
                >
                  Submit application
                </LoadingButton>
              )}
              {!readOnly && application.status === 1 && canReopen && !managedFormStage && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:lock-open-outline" width={16} />}
                  loading={reopening}
                  disabled={interactionLocked}
                  onClick={onReopen}
                >
                  Reopen form
                </LoadingButton>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
}

type RuntimeOptionRequest = {
  code: string;
  sourceKey: string;
  parentId?: string;
  academicYearId: string;
};

function groupStudentDetailFields<
  T extends { code: string; label: string; bindingKey?: string | null },
>(fields: T[]) {
  const names = [
    'Student information',
    'Parent and guardian',
    'Address and contact',
    'Previous school',
    'Other details',
  ] as const;
  const groups = names.map((name) => ({ name, fields: [] as T[] }));

  fields.forEach((field) => {
    const identity = `${field.bindingKey ?? ''} ${field.code} ${field.label}`.toLowerCase();
    const groupIndex = /mother tongue/.test(identity)
      ? 0
      : /guardian|father|mother|sibling|family|relationship to student/.test(identity)
        ? 1
        : /address|city|state|country|postal|emergency|contact/.test(identity)
          ? 2
          : /previous|school/.test(identity)
            ? 3
            : /applicant|student|gender|birth|applying|admission category|mother tongue/.test(
                  identity
                )
              ? 0
              : 4;
    groups[groupIndex].fields.push(field);
  });

  return groups.filter((group) => group.fields.length > 0);
}
