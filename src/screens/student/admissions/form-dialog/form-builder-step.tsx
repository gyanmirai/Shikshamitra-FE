import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Stack from '@mui/material/Stack';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderSection } from './form-builder-section';

import type { AdmissionFormStepGroup } from './form-step-groups';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  step: AdmissionFormStepGroup;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectField: (sectionId: string, fieldId: string) => void;
};

export function FormBuilderStep({
  formik,
  step,
  selectedSectionId,
  selectedFieldId,
  onSelectSection,
  onSelectField,
}: Props) {
  return (
    <Stack component="section" aria-label={step.name} spacing={1} sx={{ minWidth: 0 }}>
      <SortableContext
        items={step.sections.map(({ section }) => `section:${section.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {step.sections.map(({ section, sectionIndex }) => (
          <FormBuilderSection
            key={section.id}
            formik={formik}
            sectionIndex={sectionIndex}
            selectedSectionId={selectedSectionId}
            selectedFieldId={selectedFieldId}
            onSelectSection={onSelectSection}
            onSelectField={(fieldId) => onSelectField(section.id, fieldId)}
          />
        ))}
      </SortableContext>
    </Stack>
  );
}
