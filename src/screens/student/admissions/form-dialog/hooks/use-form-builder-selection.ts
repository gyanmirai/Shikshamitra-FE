import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useRef, useState, useCallback } from 'react';

type BuilderPanel = 'outline' | 'form' | 'settings';
type Sections = CreateUpdateAdmissionForm['sections'];

function rememberSelection(sections: Sections, sectionId: string | null, fieldId: string | null) {
  const section = sections.find((item) => item.id === sectionId);
  const origin = section?.fields.find((field) => field.inheritedFrom)?.inheritedFrom;
  return {
    sectionId,
    fieldId,
    sourceFormId: origin?.inquiryFormDefinitionId,
    sourceSectionCode: origin ? section?.code : undefined,
    sourceFieldCode: origin
      ? section?.fields.find((field) => field.id === fieldId)?.code
      : undefined,
  };
}

export function useFormBuilderSelection(sections: CreateUpdateAdmissionForm['sections']) {
  const currentSections = useRef(sections);
  currentSections.current = sections;
  const [selection, setSelection] = useState(() =>
    rememberSelection(sections, sections[0]?.id ?? null, sections[0]?.fields[0]?.id ?? null)
  );
  const [panel, setPanel] = useState<BuilderPanel>('form');
  const selectedSection =
    sections.find((section) => section.id === selection.sectionId) ??
    sections.find(
      (section) =>
        selection.sourceFormId &&
        section.code === selection.sourceSectionCode &&
        section.fields.some(
          (field) => field.inheritedFrom?.inquiryFormDefinitionId === selection.sourceFormId
        )
    ) ??
    sections[0];
  const selectedSectionId = selectedSection?.id ?? null;
  const selectedFieldId =
    selectedSection?.id === selection.sectionId
      ? selection.fieldId
      : selection.sourceFormId && selectedSection?.code === selection.sourceSectionCode
        ? (selectedSection.fields.find((field) => field.code === selection.sourceFieldCode)?.id ??
          null)
        : (selectedSection?.fields[0]?.id ?? null);
  const sectionIndex = sections.findIndex((section) => section.id === selectedSectionId);
  const fieldIndex =
    selectedSection?.fields.findIndex((field) => field.id === selectedFieldId) ?? -1;
  const selectedLocation =
    sectionIndex >= 0 && fieldIndex >= 0 ? { sectionIndex, fieldIndex } : null;
  const select = useCallback((sectionId: string, fieldId: string | null) => {
    setSelection(rememberSelection(currentSections.current, sectionId, fieldId));
    setPanel(fieldId ? 'settings' : 'form');
  }, []);
  const selectField = (fieldId: string) => {
    const section = sections.find((item) => item.fields.some((field) => field.id === fieldId));
    if (section) select(section.id, fieldId);
  };
  const selectForReorder = (sectionId: string, fieldId: string) => {
    setSelection(rememberSelection(sections, sectionId, fieldId));
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
