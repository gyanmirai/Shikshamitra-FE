import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Stack from '@mui/material/Stack';

import { FormBuilderSection } from '../form-builder-section';
import { useFormInheritance } from '../hooks/use-form-inheritance';
import { getInheritancePreviewValues } from '../form-inheritance-model';

import type { BuilderNavigationRequest } from '../types/builder-navigation';

type SectionProps = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  effectiveForm: CreateUpdateAdmissionForm;
  sectionIndex: number;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  onSelect: (sectionId: string, fieldId: string | null) => void;
  navigationRequest?: BuilderNavigationRequest;
};

/** Render the effective structure while every editable path still addresses the base draft. */
export function EffectiveFormBuilderSection({
  formik,
  effectiveForm,
  sectionIndex,
  selectedSectionId,
  selectedFieldId,
  onSelect,
  navigationRequest,
}: SectionProps) {
  const section = effectiveForm.sections[sectionIndex];
  const baseIndex = formik.values.sections.findIndex((base) => base.id === section.id);
  const readOnly = baseIndex < 0;
  return (
    <FormBuilderSection
      formik={readOnly ? { ...formik, values: effectiveForm } : formik}
      sectionIndex={readOnly ? sectionIndex : baseIndex}
      displaySection={section}
      readOnly={readOnly}
      navigationRequest={navigationRequest}
      selectedSectionId={selectedSectionId}
      selectedFieldId={selectedFieldId}
      onSelectSection={(id) => onSelect(id, null)}
      onSelectField={(id) => onSelect(section.id, id)}
    />
  );
}

/** Compatibility surface for consumers that render only the source-owned sections. */
export function InheritedFormSections() {
  const inheritance = useFormInheritance();
  if (!inheritance?.enabled || !inheritance.preview) return null;
  const effectiveForm = getInheritancePreviewValues(
    inheritance.formik.values,
    inheritance.preview.definition
  );
  return (
    <Stack spacing={1}>
      {effectiveForm.sections.map((section, sectionIndex) =>
        section.fields.some((field) => field.inheritedFrom) &&
        !inheritance.formik.values.sections.some((base) => base.id === section.id) ? (
          <EffectiveFormBuilderSection
            key={section.id}
            formik={inheritance.formik}
            effectiveForm={effectiveForm}
            sectionIndex={sectionIndex}
            selectedSectionId={null}
            selectedFieldId={inheritance.selectedField?.id ?? null}
            onSelect={(_, fieldId) =>
              inheritance.selectField(section.fields.find((field) => field.id === fieldId) ?? null)
            }
          />
        ) : null
      )}
    </Stack>
  );
}
