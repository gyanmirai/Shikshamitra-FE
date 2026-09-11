import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Button, Typography } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderStep } from '../form-builder-step';
import { FormBuilderSection } from '../form-builder-section';
import { getAdmissionFormStepGroups } from '../form-step-groups';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  onSelect: (sectionId: string, fieldId: string | null) => void;
  onAdd: () => void;
  onShowFields: () => void;
};

export function FormBuilderCanvas({
  formik,
  selectedSectionId,
  selectedFieldId,
  onSelect,
  onAdd,
  onShowFields,
}: Props) {
  const isStepper = formik.values.layoutType === 1;
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  return (
    <Stack sx={{ height: 1, minHeight: 0, bgcolor: 'background.paper' }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={1}
        sx={{ p: 2, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box>
          <Typography variant="subtitle1">Your form</Typography>
          <Typography variant="caption" color="text.secondary">
            {isStepper
              ? 'Steps contain sections. Sections contain fields.'
              : 'Group related fields into sections.'}
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={onAdd}
          sx={{ flexShrink: 0 }}
        >
          {isStepper ? 'Add step' : 'Add section'}
        </Button>
      </Stack>
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="caption" color="text.secondary">
            Select a section to add fields. Select a field to edit its settings.
          </Typography>
          {isStepper ? (
            steps.map((step, stepIndex) => (
              <FormBuilderStep
                key={step.id}
                formik={formik}
                step={step}
                stepIndex={stepIndex}
                stepCount={steps.length}
                selectedSectionId={selectedSectionId}
                selectedFieldId={selectedFieldId}
                onSelectSection={(id) => onSelect(id, null)}
                onSelectField={onSelect}
              />
            ))
          ) : (
            <SortableContext
              items={formik.values.sections.map((section) => `section:${  section.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {formik.values.sections.map((section, sectionIndex) => (
                <FormBuilderSection
                  key={section.id}
                  formik={formik}
                  sectionIndex={sectionIndex}
                  selectedSectionId={selectedSectionId}
                  selectedFieldId={selectedFieldId}
                  onSelectSection={(id) => onSelect(id, null)}
                  onSelectField={(id) => onSelect(section.id, id)}
                />
              ))}
            </SortableContext>
          )}
          <Button
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={onShowFields}
            sx={{ display: { lg: 'none' } }}
          >
            Add fields to this section
          </Button>
        </Stack>
      </Scrollbar>
    </Stack>
  );
}
