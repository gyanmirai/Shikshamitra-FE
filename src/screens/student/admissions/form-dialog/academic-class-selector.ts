import type { AdmissionFormField, CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { newField, nextFieldOrder, nextFieldDisplayOrder } from './form-dialog-model';
import { parseRuntimeOptionsSource } from '../application-detail/application-runtime-options';

type Field = CreateUpdateAdmissionForm['sections'][number]['fields'][number];

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
  field.fieldType === 6 && !field.readOnly && configuration(field)?.source === source &&
  (configuration(field)?.parentField || undefined) === parentField;

export function findAcademicClassSelectorField(fields: Field[], includeLegacy = true) {
  return (includeLegacy ? fields.find(field => compatible(field, 'Standards')) : undefined) ?? fields.find(field => {
    const source = configuration(field);
    if (field.fieldType !== 6 || source?.source !== 'StandardsByMedium') return false;
    const medium = fields.find(item => item.code === source.parentField);
    const board = medium && fields.find(item => item.code === configuration(medium)?.parentField);
    return Boolean(medium && board && compatible(medium, 'EducationMediums', board.code) && compatible(board, 'EducationBoards'));
  });
}

export function addAcademicClassSelector(form: CreateUpdateAdmissionForm, selectedSectionId: string | null, inheritedFields: AdmissionFormField[] = []) {
  const local = form.sections.flatMap(section => section.fields);
  // Inquiry owns its field definition; Registration reuses its source and never rewrites it.
  const inheritedClass = findAcademicClassSelectorField(inheritedFields);
  if (inheritedClass) return { form, sectionId: null, fieldId: inheritedClass.id, inheritedField: inheritedFields.find(field => field.id === inheritedClass.id) };
  const existingLegacy = local.find(field => compatible(field, 'Standards'));
  if (existingLegacy) return { form, sectionId: existingLegacy.sectionId, fieldId: existingLegacy.id, inheritedField: undefined };
  const selected = form.sections.find(section => section.id === selectedSectionId && !section.isRepeatable) ??
    form.sections.find(section => !section.isRepeatable);
  const section = selected ?? {
    id: crypto.randomUUID(), code: 'ADMISSION_PREFERENCES', name: 'Admission preferences',
    displayOrder: form.sections.length, isRepeatable: false, minEntries: 1, maxEntries: 1, fields: [],
  };
  const all = [...inheritedFields, ...local];
  const usedCodes = new Set(all.map(field => field.code.toUpperCase()));
  const additions: Field[] = [];
  const obtain = (label: string, key: string, parentField?: string) => {
    const existing = all.find(field => compatible(field, key, parentField));
    if (existing) return existing;
    const field = newField(section.id, nextFieldOrder(form.sections) + additions.length, 6);
    const base = label.toUpperCase(); let code = base;
    for (let suffix = 2; usedCodes.has(code); suffix += 1) code = `${base}_${suffix}`;
    usedCodes.add(code);
    Object.assign(field, { code, label, bindingType: 1, bindingKey: code,
      displayOrder: nextFieldDisplayOrder(form.sections) + additions.length,
      optionsJson: JSON.stringify({ source: key, ...(parentField ? { parentField } : {}) }),
    });
    additions.push(field); all.push(field);
    return field;
  };
  // Prefer an already linked complete chain over another independent board question.
  const existingClass = findAcademicClassSelectorField(all);
  if (existingClass) return { form, sectionId: existingClass.sectionId, fieldId: existingClass.id, inheritedField: undefined };
  const board = obtain('Board', 'EducationBoards');
  const medium = obtain('Medium', 'EducationMediums', board.code);
  const standard = obtain('Class', 'StandardsByMedium', medium.code);
  const sections = selected
    ? form.sections.map(item => item.id === section.id ? {...item, fields: [...item.fields, ...additions]} : item)
    : [...form.sections, {...section, fields: additions}];
  return { form: { ...form, sections }, sectionId: standard.sectionId, fieldId: standard.id, inheritedField: undefined };
}
