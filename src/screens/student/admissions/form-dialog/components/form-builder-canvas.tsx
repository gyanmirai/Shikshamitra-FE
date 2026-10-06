import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Button, Typography } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderStep } from '../form-builder-step';
import { FormBuilderSection } from '../form-builder-section';
import { getAdmissionFormStepGroups } from '../form-step-groups';
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
      sx={{ height: 1, minHeight: 0, bgcolor: 'background.paper' }}
    >
      {isStepper && (
        <Box
          sx={{
            width: { xs: 1, md: 200 },
            flexShrink: 0,
            p: 1.5,
            overflowY: 'auto',
            borderRight: { md: 1 },
            borderBottom: { xs: 1, md: 0 },
            borderColor: 'divider',
          }}
        >
          <AdmissionFormStepNavigation
            steps={steps.map((step) => ({
              id: step.id,
              name: step.name,
              caption: `${step.sections.length} ${step.sections.length === 1 ? 'section' : 'sections'}`,
            }))}
            activeStep={activeStepIndex}
            onStepChange={(index) => selectSection(steps[index].sections[0].section.id)}
            disabled={formik.isSubmitting}
          >
            <Button
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:plus" />}
              disabled={formik.isSubmitting}
              onClick={() => onAddStep(activeStep?.id)}
            >
              Add step
            </Button>
          </AdmissionFormStepNavigation>
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
        <Scrollbar
          fillContent
          sx={{
            height: 1,
            '& .simplebar-content-wrapper': { overflowX: 'hidden !important' },
            '& .simplebar-track.simplebar-horizontal': { display: 'none' },
          }}
        >
          <Stack spacing={1} sx={{ p: { xs: 1.5, sm: 2 } }}>
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
                  stepIndex={steps.findIndex((item) => item.id === step.id)}
                  selectedSectionId={selectedSectionId}
                  selectedFieldId={selectedFieldId}
                  onSelectSection={selectSection}
                  onSelectField={selectField}
                  newlyAdded={step.id === newStepId}
                  onNewStepReady={onNewStepReady}
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
      </Box>
    </Stack>
  );
}
