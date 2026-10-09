import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useRef, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { useResponsive } from 'src/hooks/use-responsive';
import { Box, Card, Stack, Typography } from '@mui/material';

import { FormReviewSection } from './form-review-section';
import { FormValidationPanel } from '../form-validation-panel';
import { getAdmissionFormStepGroups } from '../form-step-groups';
import { AdmissionDialogTitle } from '../../admission-dialog-title';
import { getDependentAdmissionFieldCodes } from '../../admission-field-dependencies';
import { AdmissionFormStepNavigation } from '../../components/admission-form-step-navigation';

type Props = { formik: FormikProps<CreateUpdateAdmissionForm> };

export function FormBuilderReview({ formik }: Props) {
  const form = formik.values;
  const desktop = useResponsive('up', 'md');
  const steps = getAdmissionFormStepGroups(form.sections);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    previewScrollRef.current?.scrollTo?.({ top: 0 });
  }, [activeStepId]);
  const activeStep = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStepId)
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const previewAnswers = Object.fromEntries(
    form.sections
      .flatMap((section) => section.fields)
      .map((field) => [field.code, answers[field.code] ?? field.defaultValue ?? ''])
  );
  const sections =
    form.layoutType === 1
      ? (steps[activeStep]?.sections ?? [])
      : form.sections.map((section, sectionIndex) => ({ section, sectionIndex }));
  const changeAnswer = (code: string, value: string) => {
    const dependents = getDependentAdmissionFieldCodes(
      form.sections.flatMap((section) => section.fields),
      code
    );
    setAnswers((current) => ({
      ...current,
      [code]: value,
      ...Object.fromEntries(dependents.map((dependent) => [dependent, ''])),
    }));
  };
  const navigation = (
    <Box sx={{ p: 1.5 }}>
      <AdmissionFormStepNavigation
        steps={steps.map((step) => ({ id: step.id, name: step.name }))}
        activeStep={activeStep}
        disabled={formik.isSubmitting}
        onStepChange={(index) => setActiveStepId(steps[index].id)}
      />
    </Box>
  );
  return (
    <Stack
      spacing={2}
      sx={{
        width: 1,
        height: 1,
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        maxWidth: 1440,
        mx: 'auto',
        p: { xs: 1.5, sm: 2 },
        overflow: 'hidden',
      }}
    >
      <Box sx={{ minWidth: 0, flexShrink: 0 }}>
        <Typography component="h2" variant="h6" tabIndex={-1} sx={{ overflowWrap: 'anywhere' }}>
          {form.description ? (
            <AdmissionDialogTitle
              title={form.name || 'Untitled form'}
              helpText={form.description}
              helpLabel="About this admission form"
            />
          ) : (
            form.name || 'Untitled form'
          )}
        </Typography>
      </Box>
      <FormValidationPanel form={form} />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
        sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}
      >
        {form.layoutType === 1 && !!steps.length && (
          <Card
            component="aside"
            aria-label="Form step navigation"
            variant="outlined"
            sx={{
              width: { xs: 1, md: 220 },
              minWidth: 0,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: { xs: 'auto', md: 1 },
              bgcolor: 'background.paper',
              borderRadius: 2,
              borderColor: 'divider',
            }}
          >
            {desktop ? (
              <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
                {navigation}
              </Scrollbar>
            ) : (
              navigation
            )}
          </Card>
        )}
        <Scrollbar
          ref={previewScrollRef}
          aria-label="Form preview sections"
          sx={{
            flex: 1,
            width: 1,
            minWidth: 0,
            minHeight: 0,
            '& > .simplebar-track.simplebar-horizontal': { display: 'none' },
          }}
          slotProps={{ contentWrapper: { overflowX: 'hidden' } }}
        >
          <Stack spacing={1.5} sx={{ minWidth: 0, pb: 1, pr: 1 }}>
            {sections.map(({ section, sectionIndex }) => (
              <FormReviewSection
                key={section.id}
                formik={formik}
                sectionIndex={sectionIndex}
                answers={previewAnswers}
                onChangeAnswer={changeAnswer}
              />
            ))}
            {!form.sections.length && (
              <Stack
                spacing={1}
                alignItems="center"
                sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}
              >
                <Typography variant="subtitle1">No sections to review</Typography>
                <Typography variant="body2" color="text.secondary">
                  Return to Build form to add sections.
                </Typography>
              </Stack>
            )}
          </Stack>
        </Scrollbar>
      </Stack>
    </Stack>
  );
}
