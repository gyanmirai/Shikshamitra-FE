import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderStep } from '../form-builder-step';
import { FormBuilderSection } from '../form-builder-section';
import { getAdmissionFormStepGroups } from '../form-step-groups';
import { FormBuilderStepHeader } from './form-builder-step-header';
import { AdmissionFormStepNavigation } from '../../components/admission-form-step-navigation';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  showAllSteps?: boolean;
  onSelect: (sectionId: string, fieldId: string | null) => void;
  newStepId: string | null;
  onAddStep: (afterStepId?: string) => void;
  onNewStepReady: (stepId: string | null) => void;
  footer?: ReactNode;
};

export function FormBuilderCanvas({
  formik,
  selectedSectionId,
  selectedFieldId,
  showAllSteps = false,
  onSelect,
  newStepId,
  onAddStep,
  onNewStepReady,
  footer,
}: Props) {
  const isStepper = formik.values.layoutType === 1;
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.sections.some(({ section }) => section.id === selectedSectionId))
  );
  const activeStep = steps[activeStepIndex];
  const selectSection = (sectionId: string) => onSelect(sectionId, null);
  const selectField = (sectionId: string, fieldId: string) => onSelect(sectionId, fieldId);
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      sx={{
        height: 1,
        minHeight: 0,
        p: { xs: 1.5, sm: 2 },
        bgcolor: 'background.paper',
        ...(footer && { pr: 0, pb: 0 }),
      }}
    >
      {isStepper && (
        <Box
          sx={{
            width: { xs: 1, md: 240, xl: 260 },
            flexShrink: 0,
            minHeight: 0,
            overflow: 'hidden',
            mb: footer ? 2 : 0,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: { xs: 'auto', md: 1 },
              maxHeight: 1,
              borderRadius: 2,
              borderColor: 'divider',
              '& .MuiStepLabel-root': { py: 0.5 },
              '& .MuiStepConnector-line': { minHeight: 16 },
            }}
          >
            <Scrollbar fillContent sx={{ flex: { xs: '0 1 auto', md: 1 }, minHeight: 0 }}>
              <Box sx={{ p: 1.5 }}>
                <AdmissionFormStepNavigation
                  steps={steps.map((step) => ({
                    id: step.id,
                    name: step.name,
                    caption: `${step.sections.length} ${step.sections.length === 1 ? 'section' : 'sections'}`,
                  }))}
                  activeStep={activeStepIndex}
                  onStepChange={(index) => selectSection(steps[index].sections[0].section.id)}
                  disabled={formik.isSubmitting}
                  renderStepLabel={(index) => (
                    <FormBuilderStepHeader
                      formik={formik}
                      step={steps[index]}
                      selected={index === activeStepIndex}
                      onSelect={() => selectSection(steps[index].sections[0].section.id)}
                      newlyAdded={steps[index].id === newStepId}
                      onNewStepReady={onNewStepReady}
                    />
                  )}
                />
              </Box>
            </Scrollbar>
            <Box sx={{ p: 1.5, flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:plus" />}
                disabled={formik.isSubmitting}
                onClick={() => onAddStep(activeStep?.id)}
              >
                Add step
              </Button>
            </Box>
          </Card>
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 }}>
        <Scrollbar
          fillContent
          sx={{
            height: footer ? 'auto' : 1,
            flex: footer ? 1 : undefined,
            '& .simplebar-content-wrapper': { overflowX: 'hidden !important' },
            '& .simplebar-track.simplebar-horizontal': { display: 'none' },
          }}
        >
          <Stack spacing={1} sx={{ pb: 0.5, pl: 0.25, pr: footer ? 2 : 0.25 }}>
            {!formik.values.sections.length && (
              <Typography variant="body2" color="text.secondary">
                This draft has no sections. Add a section to start building the form.
              </Typography>
            )}
            {isStepper ? (
              (showAllSteps ? steps : activeStep ? [activeStep] : []).map((step) => (
                <FormBuilderStep
                  key={step.id}
                  formik={formik}
                  step={step}
                  selectedSectionId={selectedSectionId}
                  selectedFieldId={selectedFieldId}
                  onSelectSection={selectSection}
                  onSelectField={selectField}
                />
              ))
            ) : (
              <SortableContext
                items={formik.values.sections.map((section) => `section:${section.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {formik.values.sections.map((section, sectionIndex) => (
                  <FormBuilderSection
                    key={section.id}
                    formik={formik}
                    sectionIndex={sectionIndex}
                    selectedSectionId={selectedSectionId}
                    selectedFieldId={selectedFieldId}
                    onSelectSection={selectSection}
                    onSelectField={(id) => selectField(section.id, id)}
                  />
                ))}
              </SortableContext>
            )}
          </Stack>
        </Scrollbar>
        {footer}
      </Box>
    </Stack>
  );
}
