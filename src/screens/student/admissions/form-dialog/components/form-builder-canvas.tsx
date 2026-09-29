import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { Stack, Typography } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
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
  onShowFullStructureChange: (show: boolean) => void;
};

export function FormBuilderCanvas({
  formik,
  selectedSectionId,
  selectedFieldId,
  showFullStructure,
  onSelect,
  onShowFullStructureChange,
}: Props) {
  const isStepper = formik.values.layoutType === 1;
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  const selectedSectionIndex = formik.values.sections.findIndex(
    (section) => section.id === selectedSectionId
  );
  const selectedSection = formik.values.sections[selectedSectionIndex] ?? formik.values.sections[0];
  const focused = !showFullStructure && Boolean(selectedSection);
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
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={1.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="caption" color="text.secondary">
            {!formik.values.sections.length
              ? 'This draft has no sections. Add a section to continue building the form.'
              : focused
              ? 'Select a field to edit its settings. Drag fields to change their order.'
              : 'Select a section in the outline or below to focus its fields.'}
          </Typography>
          {focused && selectedSection ? (
            <SortableContext
              items={[`section:${selectedSection.id}`]}
              strategy={verticalListSortingStrategy}
            >
              <FormBuilderSection
                key={selectedSection.id}
                formik={formik}
                sectionIndex={selectedSectionIndex >= 0 ? selectedSectionIndex : 0}
                selectedSectionId={selectedSection.id}
                selectedFieldId={selectedFieldId}
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
