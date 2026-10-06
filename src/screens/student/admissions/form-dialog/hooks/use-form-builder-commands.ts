import type { FormikProps } from 'formik';
import type {
  CreateUpdateAdmissionForm,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { shikshaMitraToast } from 'src/components/toast';
import { useGetAdmissionFormSystemFieldsQuery } from 'src/redux/student/admissions/admission-forms-api';

import { nextStepNumber, nextSectionNumber, getAdmissionFormStepGroups } from '../form-step-groups';
import { configureStudentField, connectStudentAddressFields } from '../student-field-configuration';
import {
  newField,
  nextFieldOrder,
  hasSystemBinding,
  nextFieldDisplayOrder,
} from '../form-dialog-model';
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
  const addCanvasUnit = (afterStepId?: string) => {
    const id = crypto.randomUUID();
    const sectionNumber = nextSectionNumber(formik.values.sections);
    const stepId = isStepper ? crypto.randomUUID() : undefined;
    const afterStepIndex = isStepper ? steps.findIndex((step) => step.id === afterStepId) : -1;
    const stepOrder =
      afterStepIndex >= 0
        ? afterStepIndex + 1
        : Math.max(-1, ...steps.map((step) => step.displayOrder)) + 1;
    const sections = formik.values.sections.map((section) => {
      if (afterStepIndex < 0) return section;
      const currentStepIndex = steps.findIndex(
        (step) => step.id === (section.stepId ?? section.id)
      );
      const nextStepIndex = currentStepIndex >= stepOrder ? currentStepIndex + 1 : currentStepIndex;
      return {
        ...section,
        stepDisplayOrder: nextStepIndex,
        stepName:
          section.stepName === `Step ${currentStepIndex + 1}`
            ? `Step ${nextStepIndex + 1}`
            : section.stepName,
      };
    });
    const newSection = {
      id,
      code: `SECTION_${sectionNumber}`,
      name: `Section ${isStepper ? 1 : sectionNumber}`,
      displayOrder: sections.length,
      stepId,
      stepCode: stepId ? `STEP_${nextStepNumber(formik.values.sections)}` : undefined,
      stepName: stepId
        ? `Step ${afterStepIndex >= 0 ? stepOrder + 1 : steps.length + 1}`
        : undefined,
      stepDisplayOrder: stepId ? stepOrder : undefined,
      isRepeatable: false,
      minEntries: 1,
      maxEntries: 1,
      fields: [],
    };
    if (afterStepIndex >= 0) {
      const lastSectionIndex = sections.findLastIndex(
        (section) => (section.stepId ?? section.id) === afterStepId
      );
      sections.splice(lastSectionIndex + 1, 0, newSection);
      formik.setFieldValue(
        'sections',
        sections.map((section, index) => ({ ...section, displayOrder: index }))
      );
    } else {
      formik.setFieldValue('sections', [...sections, newSection]);
    }
    onSelect(id, null);
    return stepId;
  };
  const addSection = () => {
    const selected = formik.values.sections.find((section) => section.id === selectedSectionId);
    if (!isStepper || !selected) {
      addCanvasUnit();
      return;
    }
    const number = nextSectionNumber(formik.values.sections);
    const step = steps.find((item) =>
      item.sections.some(({ section }) => section.id === selected.id)
    );
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
    field.displayOrder = nextFieldDisplayOrder(formik.values.sections);
    if (metadata) {
      field.code = metadata.key.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
      field.label = metadata.displayName;
      field.bindingType = 0;
      field.bindingKey = metadata.key;
      field.readOnly = metadata.readOnly;
      field.optionsJson = metadata.optionsJson;
      Object.assign(field, configureStudentField(field, metadata));
    }
    const sections = formik.values.sections.length
      ? formik.values.sections.map((item, index) =>
          index === sectionIndex ? { ...item, fields: [...item.fields, field] } : item
        )
      : [{ ...section, fields: [field] }];
    const connected = connectStudentAddressFields(sections.flatMap((item) => item.fields));
    formik.setFieldValue(
      'sections',
      sections.map((item) => ({
        ...item,
        fields: item.fields.map(
          (itemField) => connected.find((next) => next.id === itemField.id) ?? itemField
        ),
      }))
    );
    onSelect(section.id, field.id);
  };

  const addGroupSection = (name: string, groupFields: AdmissionFormSystemFieldMetadata[]) => {
    const usedBindings = new Set(
      formik.values.sections.flatMap((section) =>
        section.fields
          .filter((field) => field.bindingType === 0 && field.bindingKey)
          .map((field) => field.bindingKey!.toLowerCase())
      )
    );
    const availableFields = groupFields.filter(
      (field) => !usedBindings.has(field.key.toLowerCase())
    );
    if (!availableFields.length) {
      shikshaMitraToast.info({
        message: `All ${name.toLowerCase()} fields are already in the form.`,
      });
      return null;
    }

    const id = crypto.randomUUID();
    const selected = formik.values.sections.find((section) => section.id === selectedSectionId);
    const selectedStep = steps.find((step) =>
      step.sections.some(({ section }) => section.id === selected?.id)
    );
    const stepId = isStepper ? (selectedStep?.id ?? crypto.randomUUID()) : undefined;
    const fieldOrder = nextFieldDisplayOrder(formik.values.sections);
    const usedCodes = new Set(
      formik.values.sections.flatMap((section) =>
        section.fields.map((field) => field.code.toUpperCase())
      )
    );
    const fields = availableFields.map((metadata, index) => {
      const field = newField(id, fieldOrder + index, metadata.fieldType);
      const baseCode = metadata.key.replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();
      let code = baseCode;
      let suffix = 2;
      while (usedCodes.has(code)) {
        code = `${baseCode}_${suffix}`;
        suffix += 1;
      }
      usedCodes.add(code);
      field.code = code;
      field.label = metadata.displayName;
      field.bindingType = 0;
      field.bindingKey = metadata.key;
      field.readOnly = metadata.readOnly;
      field.optionsJson = metadata.optionsJson;
      return configureStudentField(field, metadata);
    });

    const connectedFields = connectStudentAddressFields([
      ...formik.values.sections.flatMap((item) => item.fields),
      ...fields,
    ]);
    const groupFieldsWithDependencies = fields.map(
      (field) => connectedFields.find((item) => item.id === field.id) ?? field
    );
    formik.setFieldValue('sections', [
      ...formik.values.sections,
      {
        id,
        code: `SECTION_${nextSectionNumber(formik.values.sections)}`,
        name,
        displayOrder: formik.values.sections.length,
        stepId,
        stepCode: stepId
          ? (selectedStep?.code ?? `STEP_${nextStepNumber(formik.values.sections)}`)
          : undefined,
        stepName: stepId ? (selectedStep?.name ?? `Step ${steps.length + 1}`) : undefined,
        stepDisplayOrder: stepId ? (selectedStep?.displayOrder ?? steps.length) : undefined,
        stepVisibilityRuleJson: selectedStep?.visibilityRuleJson,
        isRepeatable: false,
        minEntries: 1,
        maxEntries: 1,
        fields: groupFieldsWithDependencies,
      },
    ]);
    onSelect(id, null);
    const skipped = groupFields.length - availableFields.length;
    if (skipped) {
      shikshaMitraToast.info({
        message: `${skipped} ${skipped === 1 ? 'field was' : 'fields were'} already in the form and skipped.`,
      });
    }
    return id;
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

  return {
    addCanvasUnit,
    addSection,
    addField,
    addGroupSection,
    addSectionTemplate,
    systemFieldsQuery,
  };
}
