import type { ReactNode } from 'react';
import type {
  AdmissionFormOption,
  AdmissionFormOptionsQuery,
} from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionApplication,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomStepper from 'src/components/custom-stepper';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { Box, Grid, Stack, Button, Tooltip, Typography } from '@mui/material';
import { useLazyGetAdmissionFormOptionsQuery } from 'src/redux/student/admissions/admission-forms-api';
import {
  FormSectionCard,
  FormFieldSpacing,
  FormSectionHeader,
} from 'src/components/form-section-card';

import AdmissionRuntimeField from '../admission-runtime-field';
import { useAdmissionPhotoReads } from '../use-admission-photo-reads';
import { isAdmissionSiblingField } from '../admission-sibling-runtime-field';
import { mergeInquiryContextSections } from '../inquiry-context-presentation';
import { AdmissionSectionFields } from '../components/admission-section-fields';
import { dependentAdmissionFieldValues } from '../admission-field-dependencies';
import { waitForAdmissionValidationPaint } from '../admission-validation-feedback';
import { AdmissionFormStepNavigation } from '../components/admission-form-step-navigation';
import { isAdmissionRuleVisible, readAdmissionFormValue } from '../admission-visibility-rules';
import { academicOptionsJson, isInstituteAcademicSource } from '../admission-academic-options';
import { useAdmissionAddressSync, isAdmissionCopiedAddressField } from '../admission-address-sync';
import { localizeAdmissionSection, getAdmissionLanguageLabel } from '../form-dialog/form-languages';
import {
  parseRuntimeOptionsSource,
  resolveRuntimeOptionsJson,
} from './application-runtime-options';
import {
  getAdmissionFormStepGroups,
  getVisibleAdmissionFormSteps,
} from '../form-dialog/form-step-groups';
import {
  getCorrectionSections,
  getEffectiveCorrectionValues,
} from './application-form-correction-visibility';
import {
  AdmissionRuntimePrintActions,
  hasUnsavedAdmissionPrintValues,
} from '../form-print/admission-runtime-print-actions';
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
  footerActions?: ReactNode;
  correctionMode?: boolean;
  onPhotoReadingChange?: (reading: boolean) => void;
  onValidationBusyChange?: (busy: boolean) => void;
  sectionActions?: ReactNode;
  compact?: boolean;
  readOnly?: boolean;
  academicMediumId?: string;
  publicMode?: boolean;
  allowPrint?: boolean;
  onRefresh?: () => void;
  renderToolbarActions?: (actions: { print: ReactNode; refresh: ReactNode }) => ReactNode;
  editableFieldCodes?: string[];
  canEditOverride?: boolean;
  submitLabel?: string;
  saveLabel?: string;
  guidedNavigation?: {
    stepId: string | null;
    onStepChange: (stepId: string) => void;
    reviewSectionId?: string | null;
  };
  loadOptions?: (query: AdmissionFormOptionsQuery) => Promise<AdmissionFormOption[]>;
};

/** Staff adapter. Public capabilities mount the core directly, never this hook. */
export function ApplicationRuntimeForm(props: Props) {
  const [loadOptions] = useLazyGetAdmissionFormOptionsQuery();
  return (
    <ApplicationRuntimeFormCore
      {...props}
      allowPrint
      loadOptions={(query) => loadOptions(query).unwrap()}
    />
  );
}

export function ApplicationRuntimeFormCore({
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
  footerActions,
  correctionMode = false,
  onPhotoReadingChange,
  onValidationBusyChange,
  sectionActions,
  compact = false,
  readOnly = false,
  academicMediumId,
  publicMode = false,
  allowPrint = false,
  onRefresh,
  renderToolbarActions,
  editableFieldCodes,
  canEditOverride,
  submitLabel,
  saveLabel,
  guidedNavigation,
  loadOptions,
}: Props) {
  const fieldsPerRow = form.definition.fieldsPerRow ?? 1;
  const formRoot = useRef<HTMLDivElement>(null);
  const previousErrors = useRef<Record<string, string>>({});
  const pendingErrorFocus = useRef(false);
  const [activeStep, setActiveStep] = useState(0);
  const [savedStepIds, setSavedStepIds] = useState<string[]>([]);
  const [savingStep, setSavingStep] = useState(false);
  const [validatingStep, setValidatingStep] = useState(false);
  const validationPending = useRef(false);
  const stepSavePending = useRef(false);
  const [language, setLanguage] = useState(form.definition.defaultLanguage ?? 'en');
  const supportedLanguages = form.definition.supportedLanguages?.length
    ? form.definition.supportedLanguages
    : [form.definition.defaultLanguage ?? 'en'];
  const [resolvedOptions, setResolvedOptions] = useState<Record<string, string>>({});
  const localizedSections = useMemo(
    () => form.definition.sections.map((section) => localizeAdmissionSection(section, language)),
    [form.definition.sections, language]
  );
  const contextFieldIds = useMemo(
    () =>
      new Set(
        form.inquiryContextSections?.flatMap((section) =>
          section.fields.map((field) => field.id)
        ) ?? []
      ),
    [form.inquiryContextSections]
  );
  const contextAnswers = useMemo(
    () =>
      Object.fromEntries(
        (form.inquiryContextValues ?? []).map((answer) => [
          answer.fieldCode,
          readAdmissionFormValue(answer.valueJson),
        ])
      ),
    [form.inquiryContextValues]
  );
  const displayValues = useMemo(() => ({ ...values, ...contextAnswers }), [values, contextAnswers]);
  const presentationSections = useMemo(
    () =>
      mergeInquiryContextSections(form.definition.sections, form.inquiryContextSections).map(
        (section) => localizeAdmissionSection(section, language)
      ),
    [form.definition.sections, form.inquiryContextSections, language]
  );
  const correctionSections = useMemo(
    () => (correctionMode ? getCorrectionSections(form.definition, values, undefined, true) : []),
    [correctionMode, form.definition, values]
  );
  const correctionSectionIds = useMemo(
    () => new Set(correctionSections.map(({ section }) => section.id)),
    [correctionSections]
  );
  const visibleSections = useMemo(
    () =>
      presentationSections.filter((section) =>
        correctionMode
          ? correctionSectionIds.has(section.id)
          : isAdmissionRuleVisible(section.visibilityRuleJson, displayValues)
      ),
    [presentationSections, displayValues, correctionMode, correctionSectionIds]
  );
  const isStepper = Boolean(guidedNavigation) || form.definition.layoutType === 1;
  const visibleSteps = guidedNavigation
    ? getVisibleAdmissionFormSteps(
        presentationSections,
        displayValues,
        form.definition.layoutType === 1
      )
    : getAdmissionFormStepGroups(presentationSections)
        .filter(
          (step) => correctionMode || isAdmissionRuleVisible(step.visibilityRuleJson, displayValues)
        )
        .map((step) => ({
          ...step,
          sections: step.sections.filter(({ section }) => visibleSections.includes(section)),
        }))
        .filter((step) => step.sections.length > 0);
  const safeActiveStep = guidedNavigation
    ? Math.max(
        0,
        visibleSteps.findIndex((step) => step.id === guidedNavigation.stepId)
      )
    : Math.min(activeStep, Math.max(0, visibleSteps.length - 1));
  const onGuidedStepChange = guidedNavigation?.onStepChange;
  const reviewSectionId = guidedNavigation?.reviewSectionId;
  const selectStep = (index: number) => {
    if (onGuidedStepChange) {
      const step = visibleSteps[index];
      if (step) onGuidedStepChange(step.id);
    } else {
      setActiveStep(index);
    }
  };
  const invalidCodes = new Set(
    Object.entries(fieldErrors)
      .filter(([, error]) => Boolean(error))
      .map(([code]) => code.split('[')[0])
  );
  const firstInvalidStep = visibleSteps.findIndex((step) =>
    step.sections.some(
      ({ section }) =>
        invalidCodes.has(section.code) ||
        section.fields.some((field) => invalidCodes.has(field.code))
    )
  );
  const firstInvalidStepId = visibleSteps[firstInvalidStep]?.id;
  const reviewSectionNeedsScroll =
    Boolean(reviewSectionId) &&
    visibleSteps[safeActiveStep]?.sections[0]?.section.id !== reviewSectionId;
  useEffect(() => {
    if (!reviewSectionId || !reviewSectionNeedsScroll) return undefined;
    const frame = requestAnimationFrame(() => {
      const sections = formRoot.current?.querySelectorAll<HTMLElement>(
        '[data-registration-section]'
      );
      Array.from(sections ?? [])
        .find((section) => section.dataset.registrationSection === reviewSectionId)
        ?.scrollIntoView?.({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [reviewSectionId, reviewSectionNeedsScroll]);
  const completedSteps = visibleSteps.flatMap((step, index) =>
    (form.status === 1 || savedStepIds.includes(step.id)) &&
    !step.sections.some(
      ({ section }) =>
        invalidCodes.has(section.code) ||
        section.fields.some((field) => invalidCodes.has(field.code))
    )
      ? [index]
      : []
  );
  useEffect(() => {
    const previous = previousErrors.current;
    const keys = Object.keys(fieldErrors);
    if (previous !== fieldErrors) {
      previousErrors.current = fieldErrors;
      // Fixing an error must not pull staff away from the question they are editing.
      pendingErrorFocus.current =
        Boolean(keys.length) &&
        !(
          keys.length < Object.keys(previous).length &&
          keys.every((key) => previous[key] === fieldErrors[key])
        );
    }
    if (!pendingErrorFocus.current) return undefined;
    if (isStepper && firstInvalidStep >= 0 && safeActiveStep !== firstInvalidStep) {
      if (onGuidedStepChange && firstInvalidStepId) onGuidedStepChange(firstInvalidStepId);
      else setActiveStep(firstInvalidStep);
      return undefined;
    }
    pendingErrorFocus.current = false;
    const focusError = () => {
      const invalid = formRoot.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]:not([type="hidden"]):not([aria-hidden="true"]):not(:disabled):not([aria-disabled="true"])'
      );
      // MUI's segmented date field marks its nonfocusable group invalid.
      const target = invalid?.matches('[role="group"]')
        ? (invalid.querySelector<HTMLElement>('[role="spinbutton"]') ??
          invalid.querySelector<HTMLElement>('input:not([aria-hidden="true"]), [tabindex="0"]') ??
          invalid)
        : invalid;
      target?.focus();
      target?.scrollIntoView?.({ block: 'nearest' });
    };
    const frame = requestAnimationFrame(focusError);
    return () => cancelAnimationFrame(frame);
  }, [
    isStepper,
    firstInvalidStep,
    firstInvalidStepId,
    onGuidedStepChange,
    safeActiveStep,
    fieldErrors,
  ]);
  const { readingPhoto, onPhotoReading } = useAdmissionPhotoReads();
  useEffect(() => {
    onPhotoReadingChange?.(readingPhoto);
    return () => onPhotoReadingChange?.(false);
  }, [readingPhoto, onPhotoReadingChange]);
  const interactionLocked =
    saving || submitting || reopening || readingPhoto || savingStep || validatingStep;
  const isLastStep =
    Boolean(reviewSectionId) ||
    !isStepper ||
    visibleSteps.length === 0 ||
    safeActiveStep === visibleSteps.length - 1;
  const canEditForm =
    !readOnly &&
    (canEditOverride ??
      (application.status === 0 ||
        (correctionMode &&
          form.canCorrectForm === true &&
          [1, 4, 5, 6, 7, 8].includes(application.status))));
  useAdmissionAddressSync(
    localizedSections,
    values,
    (changes) => {
      const writable = correctionMode
        ? getEffectiveCorrectionValues(form.definition, values, { ...values, ...changes })
        : changes;
      Object.entries(changes).forEach(([code, value]) => {
        if (
          writable[code] === value &&
          values[code] !== value &&
          (!publicMode || editableFieldCodes?.includes(code))
        )
          onChange(code, value);
      });
    },
    !canEditForm || interactionLocked,
    (field, entryIndex) =>
      !correctionMode ||
      correctionSections.some(({ section, rows }) =>
        rows.some(
          (row) =>
            (section.isRepeatable ? row.index === entryIndex : entryIndex === undefined) &&
            row.fields.some((item) => item.code === field.code && !item.readOnly)
        )
      )
  );
  const currentSections = isStepper
    ? (visibleSteps[safeActiveStep]?.sections.map(({ section }) => section) ?? [])
    : visibleSections;
  const fields = useMemo(
    () =>
      localizedSections
        .flatMap((section) => section.fields)
        .map((field) =>
          publicMode && field.optionsSourceJson
            ? { ...field, optionsJson: field.optionsSourceJson }
            : field
        ),
    [localizedSections, publicMode]
  );
  const updateField = (
    code: string,
    value: string,
    entryIndex?: number,
    repeatedCodes?: string[]
  ) => {
    if (publicMode && !editableFieldCodes?.includes(code)) return;
    setSavedStepIds((previous) =>
      previous.filter(
        (id) =>
          !visibleSteps
            .find((step) => step.id === id)
            ?.sections.some(({ section }) => section.fields.some((field) => field.code === code))
      )
    );
    onChange(
      code,
      entryIndex == null ? value : writeRepeatableValue(values[code], entryIndex, value)
    );
    Object.entries(
      dependentAdmissionFieldValues(fields, code, values, entryIndex, repeatedCodes)
    ).forEach(([dependentCode, nextValue]) => {
      if (!publicMode || editableFieldCodes?.includes(dependentCode))
        onChange(dependentCode, nextValue);
    });
  };
  const optionRequests = useMemo<RuntimeOptionRequest[]>(
    () =>
      localizedSections
        .flatMap((section) => section.fields)
        .reduce<RuntimeOptionRequest[]>((requests, field) => {
          const source = parseRuntimeOptionsSource(field.optionsJson);
          if (
            source &&
            source.source !== 'StudentSiblings' &&
            !isInstituteAcademicSource(academicOptionsJson(field))
          )
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
    if (publicMode || !loadOptions) return undefined;
    let cancelled = false;
    Promise.all(
      optionRequests.map(async (request) => {
        try {
          const options = await loadOptions({
            sourceKey: request.sourceKey,
            parentId: request.parentId,
            academicYearId: request.academicYearId,
          });
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
  }, [optionRequestKey, publicMode]);
  const validateNavigation = async (sections: typeof currentSections) => {
    if (validationPending.current) return false;
    validationPending.current = true;
    setValidatingStep(true);
    onValidationBusyChange?.(true);
    try {
      await waitForAdmissionValidationPaint();
      return sections
        .filter((section) =>
          form.definition.sections.some((editable) => editable.id === section.id)
        )
        .every((section) => onValidateStep(section.id));
    } finally {
      validationPending.current = false;
      setValidatingStep(false);
      onValidationBusyChange?.(false);
    }
  };
  const changeStep = async (index: number) => {
    if (interactionLocked || validationPending.current || stepSavePending.current) return;
    if (index > safeActiveStep && canEditForm) {
      const sections = visibleSteps
        .slice(safeActiveStep, index)
        .flatMap((step) => step.sections.map(({ section }) => section));
      if (!(await validateNavigation(sections))) return;
    }
    selectStep(index);
  };
  const saveAndContinue = async () => {
    if (interactionLocked || stepSavePending.current || validationPending.current) return;
    stepSavePending.current = true;
    setSavingStep(true);
    try {
      if (!(await validateNavigation(currentSections))) return;
      const saved = await onSave();
      if (saved) {
        const stepId = visibleSteps[safeActiveStep]?.id;
        if (stepId) setSavedStepIds((previous) => [...new Set([...previous, stepId])]);
        selectStep(Math.min(safeActiveStep + 1, visibleSteps.length - 1));
      }
    } finally {
      stepSavePending.current = false;
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
        ? displayValues
        : {
            ...displayValues,
            ...Object.fromEntries(
              section.fields.map((field) => [
                field.code,
                readRepeatableValues(displayValues[field.code])[entryIndex] ?? '',
              ])
            ),
          };
    return (
      <AdmissionSectionFields
        fields={fieldsToRender.filter(
          (field) =>
            (!publicMode || !isAdmissionSiblingField(field)) &&
            isAdmissionRuleVisible(field.visibilityRuleJson, rowValues)
        )}
        columns={section.fieldsPerRow ?? fieldsPerRow}
        spacing={2}
        renderField={(field) => {
          const context = contextFieldIds.has(field.id);
          const answers = context ? contextAnswers : values;
          const value =
            entryIndex === undefined
              ? (answers[field.code] ?? '')
              : (readRepeatableValues(answers[field.code])[entryIndex] ?? '');
          const fieldError = context
            ? undefined
            : fieldErrors[`${field.code}[${entryIndex}]`] || fieldErrors[field.code];
          const inheritedError =
            field.inheritedFrom &&
            fieldError?.startsWith(field.code) &&
            [' ', '['].includes(fieldError[field.code.length])
              ? `${field.label}${fieldError.slice(field.code.length)}`
              : fieldError;
          return (
            <AdmissionRuntimeField
              field={{
                ...field,
                optionsJson:
                  publicMode || isInstituteAcademicSource(academicOptionsJson(field))
                    ? field.optionsJson
                    : resolveRuntimeOptionsJson({
                        configuredOptionsJson: field.optionsJson,
                        resolvedOptionsJson: resolvedOptions[field.code],
                        currentValue: value,
                        multiple: field.fieldType === 7,
                      }),
              }}
              value={value}
              optionsResolved={publicMode}
              academicYearId={form.academicYearId}
              academicMediumId={academicMediumId}
              disabled={
                interactionLocked ||
                context ||
                !canEditForm ||
                (publicMode && !editableFieldCodes?.includes(field.code)) ||
                field.readOnly ||
                isAdmissionCopiedAddressField(field, localizedSections, rowValues)
              }
              error={
                fieldError
                  ? field.translations?.[language]?.validationMessage || inheritedError
                  : undefined
              }
              onBlur={() => {
                if (!context) onBlur(field.code);
              }}
              onBusyChange={(busy) => onPhotoReading(`${field.code}[${entryIndex ?? 0}]`, busy)}
              formValues={rowValues}
              onChange={(nextValue) =>
                context
                  ? undefined
                  : entryIndex === undefined
                    ? updateField(field.code, nextValue)
                    : updateField(
                        field.code,
                        nextValue,
                        entryIndex,
                        section.fields.map((item) => item.code)
                      )
              }
            />
          );
        }}
      />
    );
  };

  const sectionHeader = (title: string, action?: ReactNode) => ({
    title,
    icon: guidedNavigation ? undefined : GlobalIcons.admissionDetails,
    titleTypographyProps: guidedNavigation ? ({ variant: 'h5' } as const) : undefined,
    descriptionTooltip: guidedNavigation
      ? undefined
      : `Details Captured In ${title} On the Published Registration Form.`,
    action,
  });
  const { familyPrefill } = form;
  const firstParentField = visibleSections
    .flatMap((section) => section.fields)
    .find(
      (field) =>
        !contextFieldIds.has(field.id) &&
        /^(Father|Mother|Guardian)\./i.test(field.bindingKey ?? '')
    );
  const familyStatus =
    familyPrefill?.sourceApplicantId?.trim() &&
    familyPrefill.sourceApplicantName?.trim() &&
    ['father', 'mother'].includes(familyPrefill.relationship) ? (
      <Tooltip
        title={`Parent Details From ${familyPrefill.sourceApplicantName}'s Confirmed Family (${familyPrefill.relationship}).`}
      >
        <Label color="success" tabIndex={0}>
          Sibling Confirmed
        </Label>
      </Tooltip>
    ) : undefined;
  const parentSectionAction = (
    sectionFields: (typeof localizedSections)[number]['fields'],
    action?: ReactNode
  ) =>
    familyStatus && sectionFields.some((field) => field === firstParentField) ? (
      <Stack direction="row" spacing={1} alignItems="center">
        {familyStatus}
        {action}
      </Stack>
    ) : (
      action
    );
  const renderSection = (section: (typeof localizedSections)[number]) => {
    const actions = section.id === currentSections[0]?.id ? sectionActions : undefined;
    if (!section.isRepeatable) {
      const splitStudentDetails =
        !section.fields.some((field) => field.inheritedFrom || contextFieldIds.has(field.id)) &&
        form.definition.sections.some(
          (configured) =>
            configured.id === section.id && configured.name.toLowerCase() === 'student details'
        ) &&
        section.fields.length >= 10;
      const groups = splitStudentDetails
        ? groupStudentDetailFields(
            section.fields.filter((field) =>
              isAdmissionRuleVisible(field.visibilityRuleJson, displayValues)
            )
          )
        : [];
      if (guidedNavigation) {
        return (
          <Stack key={section.id} data-registration-section={section.id} spacing={2}>
            <FormSectionHeader
              {...sectionHeader(section.name, actions)}
              titleTypographyProps={{
                variant: 'h5',
                component: section.id === currentSections[0]?.id ? 'h1' : 'h2',
              }}
            />
            {renderSectionFields(section)}
          </Stack>
        );
      }
      return (
        <Box key={section.id} sx={{ width: 1 }}>
          {groups.length ? (
            <Stack spacing={2}>
              {groups.map((group, index) => (
                <FormSectionCard
                  key={group.name}
                  {...sectionHeader(
                    group.name,
                    parentSectionAction(group.fields, index === 0 ? actions : undefined)
                  )}
                >
                  {renderSectionFields(section, undefined, group.fields)}
                </FormSectionCard>
              ))}
            </Stack>
          ) : (
            <FormSectionCard
              {...sectionHeader(section.name, parentSectionAction(section.fields, actions))}
            >
              {renderSectionFields(section)}
            </FormSectionCard>
          )}
        </Box>
      );
    }

    const count = getRepeatableEntryCount(
      section.fields.map((field) => displayValues[field.code]),
      section.minEntries
    );
    const entryLabel = section.entryLabel || section.name.replace(/s$/i, '') || 'Entry';
    const maxEntries = section.maxEntries ?? 1;
    return (
      <Stack
        key={section.id}
        data-registration-section={guidedNavigation ? section.id : undefined}
        spacing={2}
      >
        <FormSectionHeader
          {...sectionHeader(section.name, parentSectionAction(section.fields, actions))}
        />
        {Array.from({ length: count }, (_, entryIndex) => entryIndex)
          .filter(
            (entryIndex) =>
              !correctionMode ||
              correctionSections.some(
                (context) =>
                  context.section.id === section.id &&
                  context.rows.some((row) => row.index === entryIndex)
              )
          )
          .map((entryIndex) => (
            <FormSectionCard
              key={`${section.id}-${entryIndex}`}
              {...sectionHeader(`${entryLabel} ${entryIndex + 1}`)}
              titleTypographyProps={undefined}
            >
              {renderSectionFields(section, entryIndex)}
              {count > Math.max(section.minEntries ?? 0, 1) &&
                canEditForm &&
                !readOnly &&
                section.fields.some((field) => !contextFieldIds.has(field.id)) && (
                  <Grid size={{ xs: 12 }}>
                    <Button
                      size="small"
                      color="error"
                      variant="text"
                      disabled={interactionLocked}
                      onClick={() =>
                        section.fields
                          .filter((field) => !contextFieldIds.has(field.id))
                          .forEach((field) =>
                            onChange(
                              field.code,
                              removeRepeatableEntry(values[field.code], entryIndex)
                            )
                          )
                      }
                    >
                      Remove {entryLabel.toLowerCase()}
                    </Button>
                  </Grid>
                )}
            </FormSectionCard>
          ))}
        {count < maxEntries &&
          canEditForm &&
          section.fields.some((field) => !contextFieldIds.has(field.id)) && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus" />}
              disabled={interactionLocked}
              onClick={() =>
                section.fields
                  .filter((field) => !contextFieldIds.has(field.id))
                  .forEach((field) =>
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

  const printAction = (
    <AdmissionRuntimePrintActions
      applicationId={application.id}
      form={form}
      values={values}
      busy={interactionLocked}
      currentStepId={visibleSteps[safeActiveStep]?.id}
      onSave={onSave}
      canSave={showSaveDraft && !readOnly && !correctionMode}
    />
  );
  const refreshAction = onRefresh && (
    <Button
      type="button"
      size="small"
      variant="outlined"
      color="inherit"
      disabled={interactionLocked || hasUnsavedAdmissionPrintValues(form, values)}
      startIcon={<Iconify icon={GlobalIcons.refresh} width={18} />}
      onClick={onRefresh}
    >
      Refresh
    </Button>
  );

  return (
    <FormBusyRegion
      busy={validatingStep}
      label="Checking form…"
      fillContent={compact}
      flattenFieldset={Boolean(guidedNavigation)}
      showOverlay={!onValidationBusyChange}
    >
      <Box
        ref={formRoot}
        sx={{
          width: 1,
          ...(compact && { flex: 1, display: 'flex', flexDirection: 'column' }),
          ...(correctionMode && { minHeight: 0 }),
        }}
      >
        <Box
          sx={
            compact
              ? {
                  width: 1,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  ...(correctionMode && { minHeight: 0 }),
                }
              : { maxWidth: 1280, mx: 'auto' }
          }
        >
          {allowPrint &&
            !publicMode &&
            (renderToolbarActions ? (
              renderToolbarActions({ print: printAction, refresh: refreshAction })
            ) : (
              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mb: 1 }}
              >
                {refreshAction}
                {printAction}
              </Stack>
            ))}
          {!compact && (
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {form.definition.name} · v{form.formVersion}
            </Typography>
          )}
          {compact && !guidedNavigation && isStepper && visibleSteps.length > 0 && (
            <Box
              component="nav"
              aria-label="Form Steps"
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
                '& .MuiStepConnector-line': { borderTopStyle: 'solid !important' },
                '& .MuiStepLabel-label': {
                  typography: 'caption',
                  mt: { xs: '0 !important', sm: '4px !important' },
                  position: { xs: 'absolute', sm: 'static' },
                  width: { xs: '1px', sm: 'auto' },
                  height: { xs: '1px', sm: 'auto' },
                  minWidth: { xs: 0, sm: 'auto' },
                  overflow: { xs: 'hidden', sm: 'visible' },
                  clipPath: { xs: 'inset(50%)', sm: 'none' },
                },
                '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': {
                  color: 'primary.main',
                },
                '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line':
                  {
                    borderColor: 'primary.main',
                  },
              }}
            >
              <Scrollbar sx={{ flexGrow: 0 }}>
                <CustomStepper
                  ariaLabel="Application form sections"
                  steps={visibleSteps.map((step) => step.name)}
                  activeStep={safeActiveStep}
                  stepStates={visibleSteps.map((_, index) =>
                    completedSteps.includes(index) ? 'completed' : 'pending'
                  )}
                  disabled={interactionLocked}
                  onStepClick={changeStep}
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
          <Box
            component={correctionMode ? Scrollbar : 'div'}
            sx={correctionMode ? { flex: '1 1 auto', minHeight: 0 } : { display: 'contents' }}
          >
            {supportedLanguages.length > 1 && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                <CustomSelect
                  size="small"
                  label="Form Language"
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
                    completedSteps={completedSteps}
                    onStepChange={changeStep}
                  />
                </Box>
              )}
              <FormFieldSpacing
                sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {isStepper ? (
                  currentSections.length ? (
                    currentSections.map(renderSection)
                  ) : (
                    <Typography color="text.secondary">
                      No visible sections are available.
                    </Typography>
                  )
                ) : (
                  visibleSections.map(renderSection)
                )}
              </FormFieldSpacing>
            </Stack>
            {documents && (!isStepper || safeActiveStep === visibleSteps.length - 1) && (
              <Stack sx={{ mt: 2 }}>{documents}</Stack>
            )}
            {beforeActions && <Box sx={{ mt: 1.5 }}>{beforeActions}</Box>}
            {!currentSections.length && sectionActions && (
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                {sectionActions}
              </Stack>
            )}
          </Box>
          <Stack
            direction="row"
            spacing={{ xs: 0.5, sm: 1 }}
            useFlexGap
            flexWrap="wrap"
            alignItems="center"
            justifyContent="flex-end"
            sx={{
              mt: compact ? 'auto' : 3,
              pt: compact ? 1 : 2,
              borderTop: 1,
              borderColor: 'divider',
              ...(correctionMode && { flexShrink: 0 }),
              ...(compact && {
                position: 'sticky',
                bottom: 0,
                bgcolor: 'background.paper',
                pt: 1,
                pb: 0.5,
                zIndex: 1,
              }),
            }}
          >
            {errors
              .filter(
                (error) =>
                  !Object.keys(fieldErrors).length ||
                  ![
                    'Complete the highlighted fields before continuing.',
                    'Complete the highlighted fields before submitting.',
                  ].includes(error)
              )
              .map((error) => (
                <StudentFeedback
                  notificationKey="STU-0205"
                  presentation="persistent"
                  severity="error"
                  key={error}
                  sx={{ width: 1 }}
                >
                  {error}
                </StudentFeedback>
              ))}
            {isStepper && visibleSteps.length > 1 && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:arrow-left" width={16} />}
                disabled={interactionLocked || safeActiveStep === 0}
                onClick={() => selectStep(Math.max(safeActiveStep - 1, 0))}
                sx={{ mr: 'auto' }}
              >
                {guidedNavigation ? 'Back' : 'Previous'}
              </Button>
            )}
            <Stack
              direction="row"
              spacing={{ xs: 0.5, sm: 1 }}
              useFlexGap
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              {footerActions}
              {showSaveDraft && canEditForm && (
                <LoadingButton
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:content-save-outline" width={16} />}
                  loading={saving && !savingStep && !submitting}
                  loadingPosition="start"
                  disabled={interactionLocked}
                  onClick={onSave}
                >
                  {saveLabel ?? 'Save'}
                </LoadingButton>
              )}
              {!isLastStep && (
                <LoadingButton
                  size="small"
                  variant={canEditForm ? 'contained' : 'outlined'}
                  endIcon={<Iconify icon="mdi:arrow-right" width={16} />}
                  loading={savingStep || validatingStep}
                  loadingPosition="end"
                  disabled={interactionLocked}
                  onClick={
                    canEditForm && showSaveDraft
                      ? saveAndContinue
                      : () => changeStep(Math.min(safeActiveStep + 1, visibleSteps.length - 1))
                  }
                >
                  {canEditForm && showSaveDraft ? 'Save & Next' : 'Next'}
                </LoadingButton>
              )}
              {isLastStep && canEditForm && (
                <LoadingButton
                  size="small"
                  variant="contained"
                  startIcon={
                    <Iconify
                      icon={correctionMode ? GlobalIcons.submit : 'mdi:send-outline'}
                      width={16}
                    />
                  }
                  loading={submitting}
                  loadingPosition="start"
                  disabled={interactionLocked || !canSubmitForm}
                  onClick={onSubmit}
                >
                  {submitLabel ?? (correctionMode ? 'Save Corrections' : 'Submit Application')}
                </LoadingButton>
              )}
              {!correctionMode &&
                !readOnly &&
                application.status === 1 &&
                canReopen &&
                !managedFormStage && (
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:lock-open-outline" width={16} />}
                    loading={reopening}
                    loadingPosition="start"
                    disabled={interactionLocked}
                    onClick={onReopen}
                  >
                    Reopen Form
                  </LoadingButton>
                )}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </FormBusyRegion>
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
