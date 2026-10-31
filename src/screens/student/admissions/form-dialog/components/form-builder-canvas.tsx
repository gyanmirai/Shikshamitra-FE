import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderStep } from '../form-builder-step';
import { getAdmissionFormStepGroups } from '../form-step-groups';
import { FormBuilderStepHeader } from './form-builder-step-header';
import { EffectiveFormBuilderSection } from './inherited-form-sections';
import { AdmissionFormStepNavigation } from '../../components/admission-form-step-navigation';

import type { BuilderNavigationRequest } from '../types/builder-navigation';

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
  beforeSections?: ReactNode;
  effectiveForm?: CreateUpdateAdmissionForm;
  navigationRequest?: BuilderNavigationRequest;
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
  beforeSections,
  effectiveForm = formik.values,
  navigationRequest,
}: Props) {
  const isStepper = effectiveForm.layoutType === 1;
  const steps = getAdmissionFormStepGroups(effectiveForm.sections);
  const activeStepIndex = Math.max(
    0,
    steps.findIndex((step) => step.sections.some(({ section }) => section.id === selectedSectionId))
  );
  const activeStep = steps[activeStepIndex];
  const selectSection = (sectionId: string) => onSelect(sectionId, null);
  const selectField = (sectionId: string, fieldId: string) => onSelect(sectionId, fieldId);
  const renderSection = (sectionIndex: number) => (
    <EffectiveFormBuilderSection
      key={effectiveForm.sections[sectionIndex].id}
      formik={formik}
      effectiveForm={effectiveForm}
      sectionIndex={sectionIndex}
      selectedSectionId={selectedSectionId}
      selectedFieldId={selectedFieldId}
      onSelect={onSelect}
      navigationRequest={navigationRequest}
    />
  );
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
                  renderStepLabel={(index) => {
                    const effectiveStep = steps[index];
                    const editableSections = effectiveStep.sections.flatMap(({ section }) => {
                      const sectionIndex = formik.values.sections.findIndex(
                        (base) => base.id === section.id
                      );
                      return sectionIndex >= 0 ? [{ section, sectionIndex }] : [];
                    });
                    const sourceOwned =
                      editableSections.length !== effectiveStep.sections.length ||
                      formik.values.layoutType === 0;
                    return (
                      <FormBuilderStepHeader
                        formik={formik}
                        step={
                          sourceOwned
                            ? effectiveStep
                            : { ...effectiveStep, sections: editableSections }
                        }
                        readOnly={sourceOwned}
                        navigationRequest={navigationRequest}
                        selected={index === activeStepIndex}
                        onSelect={() => selectSection(steps[index].sections[0].section.id)}
                        newlyAdded={steps[index].id === newStepId}
                        onNewStepReady={onNewStepReady}
                      />
                    );
                  }}
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
            {beforeSections}
            {!effectiveForm.sections.length && (
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
                  renderSection={renderSection}
                />
              ))
            ) : (
              <SortableContext
                items={effectiveForm.sections.map((section) => `section:${section.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {effectiveForm.sections.map((_, sectionIndex) => renderSection(sectionIndex))}
              </SortableContext>
            )}
          </Stack>
        </Scrollbar>
        {footer}
      </Box>
    </Stack>
  );
}
