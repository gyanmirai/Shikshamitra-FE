import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { FormBuilderSection } from './form-builder-section';
import { FormBuilderStepHeader } from './components/form-builder-step-header';
import { FormBuilderUnitSettings } from './components/form-builder-unit-settings';
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
  const settings = useBoolean();
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
        isRepeatable: false,
        minEntries: 1,
        maxEntries: 1,
        fields: [],
      },
    ]);
    onSelectSection(id);
  };
  const deleteStep = () =>
    formik.setFieldValue(
      'sections',
      formik.values.sections.filter((section) => (section.stepId ?? section.id) !== step.id)
    );

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'visible' }}>
      <FormBuilderStepHeader
        step={step}
        stepIndex={stepIndex}
        canDelete={stepCount > 1}
        settingsOpen={settings.value}
        onToggleSettings={settings.onToggle}
        onDelete={deleteStep}
      />
      <Collapse in={settings.value}>
        <FormBuilderUnitSettings
          id={`step-settings-${step.id}`}
          unit="Step"
          name={step.name}
          code={step.code}
          visibilityRule={step.visibilityRuleJson}
          onNameChange={(stepName) => updateStep({ stepId: step.id, stepName })}
          onCodeChange={(stepCode) => updateStep({ stepId: step.id, stepCode })}
          onVisibilityChange={(value) =>
            updateStep({ stepId: step.id, stepVisibilityRuleJson: value || undefined })
          }
        />
      </Collapse>
      <Stack spacing={1} sx={{ px: 1.5, pb: 1.5 }}>
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
              canDelete={step.sections.length > 1}
              onSelectSection={onSelectSection}
              onSelectField={(fieldId) => onSelectField(section.id, fieldId)}
            />
          ))}
        </SortableContext>
        <Button
          size="small"
          color="inherit"
          startIcon={<Iconify icon="mdi:plus" />}
          onClick={addSection}
          sx={{ minHeight: 44, alignSelf: 'flex-start' }}
        >
          Add section to this step
        </Button>
      </Stack>
    </Card>
  );
}
