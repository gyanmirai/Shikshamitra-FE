import type {
  AdmissionFormField,
  CreateUpdateAdmissionForm,
} from 'src/redux/student/admissions/admission-forms-api';

import { newField, nextFieldOrder } from './form-dialog-model';
import { getAdmissionFormStepGroups } from './form-step-groups';
import { placeLinkedFormFields } from './place-linked-form-fields';
import { isClassInterestQuestion } from '../admission-class-question';
import { parseRuntimeOptionsSource } from '../application-detail/application-runtime-options';

type Field = CreateUpdateAdmissionForm['sections'][number]['fields'][number];
const academicBindings = ['preference.board', 'preference.medium', 'preference.class'];
const academicLabels = ['Board', 'Medium', 'Class'] as const;
type AcademicLabel = (typeof academicLabels)[number];
export const academicGroupOrderMessage = 'Board must come before Medium, and Medium before Class.';
export function getAcademicGroupChoice(binding?: string): AcademicLabel | undefined {
  return academicLabels[academicBindings.indexOf(binding?.toLowerCase() ?? '')];
}

export const CLASS_SELECTOR_PRESET = {
  key: 'class-selector' as const,
  label: 'Class Selector',
  description: 'Linked Board, Medium and Class from Institute Setup',
  icon: 'mdi:school-outline',
  fieldType: 6 as const,
  validation: {},
};

const configuration = (field: Field) => parseRuntimeOptionsSource(field.optionsJson);
const compatible = (field: Field, source: string, parentField?: string) =>
  field.fieldType === 6 &&
  !field.readOnly &&
  configuration(field)?.source === source &&
  (configuration(field)?.parentField || undefined) === parentField;
const isLegacyInterest = (field: Field) =>
  compatible(field, 'Standards') && isClassInterestQuestion(field);

export function findAcademicFieldGroups(fields: Field[]) {
  const byCode = new Map(fields.map((field) => [field.code, field]));
  return fields.flatMap((standard) => {
    const medium = byCode.get(configuration(standard)?.parentField ?? '');
    const board = byCode.get((medium && configuration(medium)?.parentField) ?? '');
    return medium &&
      board &&
      compatible(standard, 'StandardsByMedium', medium.code) &&
      compatible(medium, 'EducationMediums', board.code) &&
      compatible(board, 'EducationBoards')
      ? [[board, medium, standard] as const]
      : [];
  });
}

export function findAcademicClassSelectorField(fields: Field[], includeLegacy = true) {
  return (
    (includeLegacy ? fields.find((field) => compatible(field, 'Standards')) : undefined) ??
    findAcademicFieldGroups(fields)[0]?.[2]
  );
}

export function getAcademicGroupOrderViolations(form: CreateUpdateAdmissionForm) {
  const sections =
    form.layoutType === 1
      ? getAdmissionFormStepGroups(form.sections).flatMap((step) =>
          step.sections.map(({ section }) => section)
        )
      : [...form.sections].sort((a, b) => a.displayOrder - b.displayOrder);
  const fields = sections.flatMap((section) =>
    [...section.fields].sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const positions = new Map(fields.map((field, index) => [field, index]));
  return findAcademicFieldGroups(fields).flatMap(([board, medium, standard]) =>
    [
      [board, medium],
      [medium, standard],
    ].flatMap(([parent, child]) =>
      positions.get(parent)! > positions.get(child)!
        ? [{ fieldId: child.id, dependencyId: parent.id }]
        : []
    )
  );
}

export function addAcademicClassSelector(
  form: CreateUpdateAdmissionForm,
  selectedSectionId: string | null,
  inheritedFields: AdmissionFormField[] = [],
  choice: AcademicLabel = 'Class'
) {
  const local = form.sections.flatMap((section) => section.fields);
  const index = academicLabels.indexOf(choice);
  const inheritedChoice =
    findAcademicFieldGroups(inheritedFields)[0]?.[index] ?? inheritedFields.find(isLegacyInterest);
  if (inheritedChoice)
    return { form, sectionId: null, fieldId: inheritedChoice.id, inheritedField: inheritedChoice };
  const inheritedBoardOrMedium = inheritedFields.some((field) =>
    ['EducationBoards', 'EducationMediums', 'StandardsByMedium'].includes(
      configuration(field)?.source ?? ''
    )
  );
  if (inheritedBoardOrMedium) return { form, sectionId: null, incompatibleSource: true };
  const selected =
    form.sections.find((section) => section.id === selectedSectionId && !section.isRepeatable) ??
    form.sections.find((section) => !section.isRepeatable);
  const section = selected ?? {
    id: crypto.randomUUID(),
    code: 'ADMISSION_PREFERENCES',
    name: 'Admission preferences',
    displayOrder: form.sections.length,
    isRepeatable: false,
    minEntries: 1,
    maxEntries: 1,
    fields: [],
  };
  const usedCodes = new Set(
    [...inheritedFields, ...local].map((field) => field.code.toUpperCase())
  );
  const additions: Field[] = [];
  const obtain = (label: string, key: string, parentField?: string, legacy?: Field) => {
    const existing = local.find((field) => compatible(field, key, parentField));
    if (existing) return existing;
    const optionsJson = JSON.stringify({ source: key, ...(parentField ? { parentField } : {}) });
    if (legacy) return { ...legacy, optionsJson };
    const field = newField(section.id, nextFieldOrder(form.sections) + additions.length, 6);
    const base = label.toUpperCase();
    let code = base;
    for (let suffix = 2; usedCodes.has(code); suffix += 1) code = `${base}_${suffix}`;
    usedCodes.add(code);
    Object.assign(field, { code, label, bindingType: 1, bindingKey: code, optionsJson });
    additions.push(field);
    return field;
  };
  // Prefer an already linked complete chain over another independent board question.
  const group =
    findAcademicFieldGroups(local)[0] ??
    (() => {
      const board = obtain('Board', 'EducationBoards');
      const medium = obtain('Medium', 'EducationMediums', board.code);
      const legacy = local.find(isLegacyInterest);
      const standard = obtain('Class', 'StandardsByMedium', medium.code, legacy);
      return [board, medium, standard] as const;
    })();
  const target = group[index];
  const sections = placeLinkedFormFields(form, section, [...group]);
  const sectionId =
    sections.find((item) => item.fields.some((field) => field.id === target.id))?.id ?? null;
  return { form: { ...form, sections }, sectionId, fieldId: target.id };
}
