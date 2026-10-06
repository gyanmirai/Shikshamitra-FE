import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Stack from '@mui/material/Stack';
import { useRef, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderSection } from './form-builder-section';
import { FormBuilderStepHeader } from './components/form-builder-step-header';

import type { AdmissionFormStepGroup } from './form-step-groups';

type Props = {
  formik: FormikProps<CreateUpdateAdmissionForm>;
  step: AdmissionFormStepGroup;
  stepIndex: number;
  selectedSectionId: string | null;
  selectedFieldId: string | null;
  onSelectSection: (sectionId: string) => void;
  onSelectField: (sectionId: string, fieldId: string) => void;
  newlyAdded: boolean;
  onNewStepReady: (stepId: string | null) => void;
};

export function FormBuilderStep({
  formik,
  step,
  stepIndex,
  selectedSectionId,
  selectedFieldId,
  onSelectSection,
  onSelectField,
  newlyAdded,
  onNewStepReady,
}: Props) {
  const settings = useBoolean(newlyAdded);
  const stepRef = useRef<HTMLDivElement>(null);
  const firstPath = `sections[${step.sections[0].sectionIndex}].stepName`;
  const nameMeta = formik.getFieldMeta<string>(firstPath);
  const nameError = nameMeta.touched ? nameMeta.error : undefined;
  useEffect(() => {
    if (newlyAdded) {
      stepRef.current?.scrollIntoView?.({ block: 'start' });
      onNewStepReady(null);
    }
  }, [newlyAdded, onNewStepReady]);
  const updateName = (stepName: string) => {
    settings.onTrue();
    formik.setFieldValue(
      'sections',
      formik.values.sections.map((section) =>
        (section.stepId ?? section.id) === step.id
          ? { ...section, stepId: step.id, stepName }
          : section
      )
    );
  };
  const deleteStep = () =>
    formik.setFieldValue(
      'sections',
      formik.values.sections.filter((section) => (section.stepId ?? section.id) !== step.id)
    );

  return (
    <Stack ref={stepRef} spacing={1} sx={{ minWidth: 0 }}>
      <FormBuilderStepHeader
        step={step}
        stepIndex={stepIndex}
        settingsOpen={settings.value || Boolean(nameError)}
        nameError={nameError}
        onNameChange={updateName}
        onNameBlur={() => formik.setFieldTouched(firstPath, true)}
        onToggleSettings={settings.onToggle}
        onDelete={deleteStep}
      />
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
