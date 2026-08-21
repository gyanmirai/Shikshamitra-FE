import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Button,
  Accordion,
  TextField,
  IconButton,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { FormBuilderSection } from './form-builder-section';
import { nextSectionNumber, type AdmissionFormStepGroup } from './form-step-groups';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  step: AdmissionFormStepGroup;
  stepIndex: number;
  stepCount: number;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectField: (sectionId: string, fieldId: string) => void;
};

export function FormBuilderStep({
  formik,
  step,
  stepIndex,
  stepCount,
  selectedSectionId,
  selectedFieldId,
  onSelectSection,
  onSelectField,
}: Props) {
  const updateStep = (updates: Partial<CreateUpdateAdmissionForm['sections'][number]>) =>
    formik.setFieldValue(
      'sections',
      formik.values.sections.map((section) =>
        (section.stepId ?? section.id) === step.id ? { ...section, ...updates } : section
      )
    );
  const addSection = () => {
    const number = nextSectionNumber(formik.values.sections);
    const id = crypto.randomUUID();
    formik.setFieldValue('sections', [
      ...formik.values.sections,
      {
        id,
        code: `SECTION_${number}`,
        name: `Section ${step.sections.length + 1}`,
        displayOrder: formik.values.sections.length,
        stepId: step.id,
        stepCode: step.code,
        stepName: step.name,
        stepDisplayOrder: step.displayOrder,
        stepVisibilityRuleJson: step.visibilityRuleJson,
        fields: [],
      },
    ]);
    onSelectSection(id);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'visible' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 1.5, py: 1.25, bgcolor: 'background.neutral', borderBottom: 1, borderColor: 'divider' }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1">{step.name || `Step ${stepIndex + 1}`}</Typography>
          <Typography variant="caption" color="text.secondary">
            Step {stepIndex + 1} · shown in the applicant stepper
          </Typography>
        </Box>
        <Chip size="small" variant="outlined" label={`${step.sections.length} ${step.sections.length === 1 ? 'section' : 'sections'}`} />
        <IconButton
          size="small"
          color="error"
          aria-label={`Delete ${step.name}`}
          disabled={stepCount < 2}
          onClick={() =>
            formik.setFieldValue(
              'sections',
              formik.values.sections.filter((section) => (section.stepId ?? section.id) !== step.id)
            )
          }
        >
          <Iconify icon="mdi:delete-outline" />
        </IconButton>
      </Stack>
      <Stack spacing={1.5} sx={{ p: 1.5 }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth size="small" label="Step code *" value={step.code} onChange={(event) => updateStep({ stepId: step.id, stepCode: event.target.value.toUpperCase() })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField fullWidth size="small" label="Step name *" value={step.name} helperText="This name appears in the applicant stepper." onChange={(event) => updateStep({ stepId: step.id, stepName: event.target.value })} />
          </Grid>
        </Grid>
        <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: '8px !important', '&::before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
            <Box>
              <Typography variant="body2" fontWeight={600}>Step visibility</Typography>
              <Typography variant="caption" color="text.secondary">Optional rule for showing this entire step.</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TextField fullWidth size="small" multiline minRows={2} label="Step visibility rule JSON" value={step.visibilityRuleJson ?? ''} helperText="Leave empty to always show this step." onChange={(event) => updateStep({ stepId: step.id, stepVisibilityRuleJson: event.target.value || undefined })} />
          </AccordionDetails>
        </Accordion>
        <SortableContext
          items={step.sections.map(({ section }) => `section:${section.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <Stack spacing={1}>
            {step.sections.map(({ section, sectionIndex }) => (
              <FormBuilderSection
                key={section.id}
                formik={formik}
                sectionIndex={sectionIndex}
                selectedSectionId={selectedSectionId}
                selectedFieldId={selectedFieldId}
                canDelete={step.sections.length > 1}
                onSelectSection={onSelectSection}
                onSelectField={(fieldId) => onSelectField(section.id, fieldId)}
              />
            ))}
          </Stack>
        </SortableContext>
        <Button size="small" variant="outlined" startIcon={<Iconify icon="mdi:plus" />} onClick={addSection} sx={{ alignSelf: 'flex-start' }}>
          Add section
        </Button>
      </Stack>
    </Card>
  );
}
