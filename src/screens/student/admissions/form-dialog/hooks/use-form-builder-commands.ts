import type { FormikProps } from 'formik';
import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { shikshaMitraToast } from 'src/components/toast';
import { useGetAdmissionFormSystemFieldsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { newField, nextFieldOrder, hasSystemBinding } from '../form-dialog-model';
import { nextStepNumber, nextSectionNumber, getAdmissionFormStepGroups } from '../form-step-groups';
import {
  type AdmissionFormSectionTemplateId,
  materializeAdmissionFormSectionTemplate,
} from '../admission-form-section-template-catalog';

import type { AdmissionFieldPreset } from '../form-field-presets';

export function useFormBuilderCommands(
  formik: FormikProps<CreateUpdateAdmissionForm>,
  selectedSectionId: string | null,
  onSelect: (sectionId: string, fieldId: string | null) => void
) {
  const isStepper = formik.values.layoutType === 1;
  const steps = getAdmissionFormStepGroups(formik.values.sections);
  const systemFieldsQuery = useGetAdmissionFormSystemFieldsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const systemFields = systemFieldsQuery.data ?? [];
  const addCanvasUnit = () => {
    const id = crypto.randomUUID();
    const sectionNumber = nextSectionNumber(formik.values.sections);
    const stepId = isStepper ? crypto.randomUUID() : undefined;
    const stepOrder = Math.max(-1, ...steps.map((step) => step.displayOrder)) + 1;
    formik.setFieldValue('sections', [
      ...formik.values.sections,
      {
        id,
        code: `SECTION_${sectionNumber}`,
        name: `Section ${isStepper ? 1 : sectionNumber}`,
        displayOrder: formik.values.sections.length,
        stepId,
        stepCode: stepId ? `STEP_${nextStepNumber(formik.values.sections)}` : undefined,
        stepName: stepId ? `Step ${stepOrder + 1}` : undefined,
        stepDisplayOrder: stepId ? stepOrder : undefined,
        isRepeatable: false,
        minEntries: 1,
        maxEntries: 1,
        fields: [],
      },
    ]);
    onSelect(id, null);
  };
  const addSection = () => {
    const selected = formik.values.sections.find((section) => section.id === selectedSectionId);
    if (!isStepper || !selected) {
      addCanvasUnit();
      return;
    }
    const number = nextSectionNumber(formik.values.sections);
    const step = steps.find((item) => item.sections.some(({ section }) => section.id === selected.id));
    const id = crypto.randomUUID();
    formik.setFieldValue('sections', [
      ...formik.values.sections,
      {
        id,
        code: `SECTION_${number}`,
        name: `Section ${(step?.sections.length ?? 0) + 1}`,
        displayOrder: formik.values.sections.length,
        stepId: step?.id,
        stepCode: step?.code,
        stepName: step?.name,
        stepDisplayOrder: step?.displayOrder,
        stepVisibilityRuleJson: step?.visibilityRuleJson,
        isRepeatable: false,
        minEntries: 1,
        maxEntries: 1,
        fields: [],
      },
    ]);
    onSelect(id, null);
  };
  const addField = (
    fieldType: CreateUpdateAdmissionForm['sections'][number]['fields'][number]['fieldType'],
    systemBinding?: string,
    preset?: AdmissionFieldPreset
  ) => {
    if (systemBinding && hasSystemBinding(formik.values.sections, systemBinding)) {
      shikshaMitraToast.error({
        message: 'This student field is already added to the form.',
      });
      return;
    }
    const selectedIndex = formik.values.sections.findIndex(
      (section) => section.id === selectedSectionId
    );
    const sectionIndex = selectedIndex >= 0 ? selectedIndex : 0;
    const section = formik.values.sections[sectionIndex] ?? {
      id: crypto.randomUUID(),
      code: 'SECTION_1',
      name: 'Student Details',
      displayOrder: 0,
      isRepeatable: false,
      minEntries: 1,
      maxEntries: 1,
      fields: [],
    };
    const metadata = systemFields.find((item) => item.key === systemBinding);
    const field = newField(
      section.id,
      nextFieldOrder(formik.values.sections),
      metadata?.fieldType ?? fieldType,
      preset
    );
    if (metadata) {
      field.code = metadata.key.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
      field.label = metadata.displayName;
      field.bindingType = 0;
      field.bindingKey = metadata.key;
      field.readOnly = metadata.readOnly;
      field.optionsJson = metadata.optionsJson;
    }
    if (formik.values.sections.length)
      formik.setFieldValue(`sections[${sectionIndex}].fields`, [...section.fields, field]);
    else formik.setFieldValue('sections', [{ ...section, fields: [field] }]);
    onSelect(section.id, field.id);
  };

  const addSectionTemplate = (templateId: AdmissionFormSectionTemplateId) => {
    const result = materializeAdmissionFormSectionTemplate(
      templateId,
      formik.values,
      selectedSectionId
    );
    if (!result.section.fields.length) {
      shikshaMitraToast.error({
        message: 'Every linked student field in this section is already present in the form.',
      });
      return;
    }
    formik.setFieldValue('sections', [...formik.values.sections, result.section]);
    onSelect(result.section.id, null);
    if (result.skippedSystemBindings.length) {
      shikshaMitraToast.info({
        message: `${result.skippedSystemBindings.length} linked student ${result.skippedSystemBindings.length === 1 ? 'field was' : 'fields were'} skipped because ${result.skippedSystemBindings.length === 1 ? 'it is' : 'they are'} already in the form.`,
      });
    }
  };

  return { addCanvasUnit, addSection, addField, addSectionTemplate, systemFieldsQuery };
}
