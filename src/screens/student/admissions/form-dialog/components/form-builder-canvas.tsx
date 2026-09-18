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
  showFullStructure: boolean;
  onSelect: (sectionId: string, fieldId: string | null) => void;
  onAdd: () => void;
  onShowSectionLibrary: () => void;
  onShowFields: () => void;
  onShowFullStructureChange: (show: boolean) => void;
};

export function FormBuilderCanvas({
  formik,
  selectedSectionId,
  selectedFieldId,
  showFullStructure,
  onSelect,
  onAdd,
  onShowSectionLibrary,
  onShowFields,
  onShowFullStructureChange,
}: Props) {
  const isStepper = formik.values.layoutType === 1;
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  const selectedSectionIndex = formik.values.sections.findIndex(
    (section) => section.id === selectedSectionId
  );
  const selectedSection = formik.values.sections[selectedSectionIndex] ?? formik.values.sections[0];
  const selectedStep = steps.find((step) =>
    step.sections.some(({ section }) => section.id === selectedSection?.id)
  );
  const focused = !showFullStructure && Boolean(selectedSection);
  const addStructureUnit = () => {
    onAdd();
    onShowFullStructureChange(false);
  };
  const selectSection = (sectionId: string) => {
    onSelect(sectionId, null);
    onShowFullStructureChange(false);
  };
  const selectField = (sectionId: string, fieldId: string) => {
    onSelect(sectionId, fieldId);
    onShowFullStructureChange(false);
  };
  return (
    <Stack sx={{ height: 1, minHeight: 0, bgcolor: 'background.paper' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1}
        sx={{ p: 2, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
            {focused ? selectedSection?.name || 'Untitled section' : 'Form structure'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {focused
              ? `${isStepper && selectedStep ? `${selectedStep.name} · ` : ''}${selectedSection?.fields.length ?? 0} ${(selectedSection?.fields.length ?? 0) === 1 ? 'field' : 'fields'}`
              : isStepper
                ? 'Manage steps and sections, then focus a section to edit its fields.'
                : 'Manage sections, then focus one section to edit its fields.'}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
          {focused ? (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:format-list-bulleted" />}
                onClick={() => onShowFullStructureChange(true)}
              >
                Manage structure
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={onShowFields}
              >
                Add field
              </Button>
            </>
          ) : (
            <>
              <Button
                size="small"
                variant="outlined"
                disabled={!selectedSection}
                startIcon={<Iconify icon="mdi:target" />}
                onClick={() => onShowFullStructureChange(false)}
              >
                Focus section
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="mdi:view-grid-plus-outline" />}
                onClick={onShowSectionLibrary}
              >
                Add from templates
              </Button>
              <Button
                size="small"
                variant="contained"
                startIcon={<Iconify icon="mdi:plus" />}
                onClick={addStructureUnit}
              >
                {isStepper ? 'Add step' : 'Add section'}
              </Button>
            </>
          )}
        </Stack>
      </Stack>
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="caption" color="text.secondary">
            {focused
              ? 'Select a field to edit its settings. Drag fields to change their order.'
              : 'Select a section in the outline or below to focus its fields.'}
          </Typography>
          {focused && selectedSection ? (
            <SortableContext
              items={[`section:${selectedSection.id}`]}
              strategy={verticalListSortingStrategy}
            >
              <FormBuilderSection
                formik={formik}
                sectionIndex={selectedSectionIndex >= 0 ? selectedSectionIndex : 0}
                selectedSectionId={selectedSection.id}
                selectedFieldId={selectedFieldId}
                canDelete={(selectedStep?.sections.length ?? formik.values.sections.length) > 1}
                sectionReorderEnabled={false}
                showInlineAddField={false}
                onSelectSection={selectSection}
                onSelectField={(id) => selectField(selectedSection.id, id)}
              />
            </SortableContext>
          ) : isStepper ? (
            steps.map((step, stepIndex) => (
              <FormBuilderStep
                key={step.id}
                formik={formik}
                step={step}
                stepIndex={stepIndex}
                stepCount={steps.length}
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
    </Stack>
  );
}
