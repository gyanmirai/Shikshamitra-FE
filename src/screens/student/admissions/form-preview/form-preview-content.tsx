import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { FormikProps } from 'formik';

import { useState } from 'react';
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
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

type Props = {
  form: AdmissionForm;
  formik: FormikProps<Record<string, string>>;
  resolvedOptions: Record<string, string>;
};

export function FormPreviewContent({
  form,
  formik,
  resolvedOptions,
}: Props) {
  const fieldsPerRow = form.fieldsPerRow ?? 1;
  const { values } = formik;
  const [activeStep, setActiveStep] = useState(0);
  const fields = form.sections.flatMap((section) => section.fields);
  const visibleSections = form.sections.filter((section) =>
    isAdmissionRuleVisible(section.visibilityRuleJson, values)
  );
  const isStepper = form.layoutType === 1;
  const visibleSteps = getAdmissionFormStepGroups(form.sections)
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
    void formik.setFieldValue(code, value);
    getDependentAdmissionFieldCodes(fields, code).forEach((dependentCode) =>
      void formik.setFieldValue(dependentCode, '')
    );
  };

  return (
    <Card component="form" onSubmit={formik.handleSubmit}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {form.name} · v{form.version}
        </Typography>
        {isStepper && visibleSteps.length > 0 && (
          <Stepper activeStep={safeActiveStep} alternativeLabel sx={{ mb: 3 }}>
            {visibleSteps.map((step) => (
              <Step key={step.id}>
                <StepLabel>{step.name}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        <Stack spacing={2}>
          {sectionsToRender.map((section) => (
            <SectionCard key={section.id} title={section.name} gridProps={{ spacing: 1 }}>
              {(() => {
                const visibleFields = section.fields.filter((field) =>
                  isAdmissionRuleVisible(field.visibilityRuleJson, values)
                );
                return visibleFields.length ? (
                  visibleFields.map((field) => (
                    <Grid key={field.code} size={{ xs: 12, sm: 12 / fieldsPerRow }}>
                      <AdmissionRuntimeField
                        field={{
                          ...field,
                          optionsJson: resolvedOptions[field.code] ?? field.optionsJson,
                        }}
                        value={values[field.code] ?? ''}
                        disabled={field.readOnly}
                        error={
                          formik.touched[field.code] && typeof formik.errors[field.code] === 'string'
                            ? formik.errors[field.code]
                            : undefined
                        }
                        onBlur={() => void formik.setFieldTouched(field.code, true)}
                        formValues={values}
                        onChange={(value) => updateField(field.code, value)}
                      />
                    </Grid>
                  ))
                ) : (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info">
                      No fields are configured for this section yet. Add fields in Form Builder
                      before publishing the form.
                    </Alert>
                  </Grid>
                );
              })()}
            </SectionCard>
          ))}
        </Stack>
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
              onClick={() =>
                setActiveStep((step) => Math.min(step + 1, visibleSteps.length - 1))
              }
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
