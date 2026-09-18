import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';

type BuilderPanel = 'outline' | 'form' | 'settings';

export function useFormBuilderSelection(sections: CreateUpdateAdmissionForm['sections']) {
  const [selection, setSelection] = useState<{ sectionId: string | null; fieldId: string | null }>(
    () => ({
      sectionId: sections[0]?.id ?? null,
      fieldId: sections[0]?.fields[0]?.id ?? null,
    })
  );
  const [panel, setPanel] = useState<BuilderPanel>('form');
  const selectedSection =
    sections.find((section) => section.id === selection.sectionId) ?? sections[0];
  const selectedSectionId = selectedSection?.id ?? null;
  const selectedFieldId =
    selectedSection?.id === selection.sectionId
      ? selection.fieldId
      : (selectedSection?.fields[0]?.id ?? null);
  const sectionIndex = sections.findIndex((section) => section.id === selectedSectionId);
  const fieldIndex =
    selectedSection?.fields.findIndex((field) => field.id === selectedFieldId) ?? -1;
  const selectedLocation =
    sectionIndex >= 0 && fieldIndex >= 0 ? { sectionIndex, fieldIndex } : null;
  const select = (sectionId: string, fieldId: string | null) => {
    setSelection({ sectionId, fieldId });
    setPanel(fieldId ? 'settings' : 'form');
  };
  const selectField = (fieldId: string) => {
    const section = sections.find((item) => item.fields.some((field) => field.id === fieldId));
    if (section) select(section.id, fieldId);
  };
  const selectForReorder = (sectionId: string, fieldId: string) => {
    setSelection({ sectionId, fieldId });
  };
  return {
    panel,
    setPanel,
    select,
    selectField,
    selectForReorder,
    selectedSection,
    selectedSectionId,
    selectedFieldId,
    selectedLocation,
  };
}
