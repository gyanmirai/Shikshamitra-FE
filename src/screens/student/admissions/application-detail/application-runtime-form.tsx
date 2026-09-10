import type {
  AdmissionApplication,
  AdmissionApplicationForm,
} from 'src/redux/student/admissions/admission-applications-api';

import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
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
import {
  parseRuntimeOptionsSource,
  resolveRuntimeOptionsJson,
} from './application-runtime-options';

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
  canReopen,
  reopening,
  onReopen,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fieldsPerRow = form.definition.fieldsPerRow ?? 1;
  const [activeStep, setActiveStep] = useState(0);
  const [loadOptions] = useLazyGetAdmissionFormOptionsQuery();
  const [resolvedOptions, setResolvedOptions] = useState<Record<string, string>>({});
  const visibleSections = useMemo(
    () =>
      form.definition.sections.filter((section) =>
        isAdmissionRuleVisible(section.visibilityRuleJson, values)
      ),
    [form.definition.sections, values]
  );
  const isStepper = form.definition.layoutType === 1;
  const visibleSteps = getAdmissionFormStepGroups(form.definition.sections)
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
    () => form.definition.sections.flatMap((section) => section.fields),
    [form.definition.sections]
  );
  const updateField = (code: string, value: string) => {
    onChange(code, value);
    getDependentAdmissionFieldCodes(fields, code).forEach((dependentCode) =>
      onChange(dependentCode, '')
    );
  };
  const optionRequests = useMemo<RuntimeOptionRequest[]>(
    () =>
      form.definition.sections
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
    [form.academicYearId, form.definition.sections, values]
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

  const renderSection = (section: (typeof form.definition.sections)[number]) => (
    <SectionCard key={section.id} title={section.name} gridProps={{ spacing: 1 }}>
      {section.fields
        .filter((field) => isAdmissionRuleVisible(field.visibilityRuleJson, values))
        .map((field) => (
          <Grid key={field.code} size={{ xs: 12, sm: 12 / fieldsPerRow }}>
            <AdmissionRuntimeField
              field={{
                ...field,
                optionsJson: resolveRuntimeOptionsJson({
                  configuredOptionsJson: field.optionsJson,
                  resolvedOptionsJson: resolvedOptions[field.code],
                  currentValue: values[field.code] ?? '',
                  multiple: field.fieldType === 7,
                }),
              }}
              value={values[field.code] ?? ''}
              disabled={field.readOnly || application.status !== 0}
              error={fieldErrors[field.code]}
              onBlur={() => onBlur(field.code)}
              formValues={values}
              onChange={(value) => updateField(field.code, value)}
            />
          </Grid>
        ))}
    </SectionCard>
  );

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
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:content-save-outline" />}
              disabled={saving || application.status !== 0}
              onClick={onSave}
            >
              Save draft
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon="mdi:send-outline" />}
              disabled={submitting || application.status !== 0}
              onClick={onSubmit}
            >
              Submit application
            </Button>
            {application.status === 1 && canReopen && (
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
