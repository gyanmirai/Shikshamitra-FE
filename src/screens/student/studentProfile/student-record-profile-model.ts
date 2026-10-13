import type {
  ProfileSectionKey,
  RecordRegistrationSource,
} from 'src/redux/student/records/student-record-details-api';
import type {
  AdmissionFormField,
  AdmissionFormOption,
  AdmissionFormSection,
} from 'src/redux/student/admissions/admission-forms-api';

import { fDate } from 'src/utils/format-time';
import { recordDiffValue, recordFieldLabel } from 'src/screens/student/records/record-diff';
import { isAdmissionRuleVisible } from 'src/screens/student/admissions/admission-visibility-rules';
import { parseFieldConfiguration } from 'src/screens/student/admissions/form-dialog/form-field-presets';
import { isAdmissionSiblingField } from 'src/screens/student/admissions/admission-sibling-runtime-field';
import { getDynamicAdmissionValidationErrors } from 'src/screens/student/admissions/admission-form-validation';
import { parseEditableAdmissionChoices } from 'src/screens/student/admissions/form-dialog/field-choice-options';
import { parseRuntimeOptionsSource } from 'src/screens/student/admissions/application-detail/application-runtime-options';

export const PROFILE_SECTIONS: { key: ProfileSectionKey; label: string; icon: string }[] = [
  { key: 'general', label: 'General', icon: 'mdi:account-outline' },
  { key: 'family', label: 'Family & guardians', icon: 'mdi:account-group-outline' },
  { key: 'communication', label: 'Contact & addresses', icon: 'mdi:map-marker-outline' },
  { key: 'additional', label: 'Additional details', icon: 'mdi:card-account-details-outline' },
  { key: 'medical', label: 'Medical', icon: 'mdi:medical-bag' },
  { key: 'previous-school', label: 'Previous school', icon: 'mdi:school-outline' },
  { key: 'bank', label: 'Bank details', icon: 'mdi:bank-outline' },
];

export const LEGACY_PROFILE_SECTIONS: Record<string, ProfileSectionKey> = {
  general: 'general',
  admission: 'family',
  communication: 'communication',
  additionalDetails: 'additional',
  medicalRecords: 'medical',
  previousSchool: 'previous-school',
  bankDetails: 'bank',
};

export function decodeProfileValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text || !/^(\[|\{|"|true$|false$|null$)/.test(text)) return value;
  try {
    return JSON.parse(text);
  } catch {
    return value;
  }
}

export const profileRuleValues = (values: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(values).map(([code, value]) => [
      code,
      typeof value === 'string'
        ? value
        : value == null
          ? ''
          : typeof value === 'object'
            ? JSON.stringify(value)
            : String(value),
    ])
  );

export function serializeProfileField(field: AdmissionFormField, value: string): unknown {
  if (value === '') return '';
  if (field.fieldType === 9 && ['true', 'false'].includes(value)) return value === 'true';
  if (field.fieldType === 2 && value.trim() && Number.isFinite(Number(value))) return Number(value);
  if ([7, 11].includes(field.fieldType)) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (field.fieldType === 7 && Array.isArray(parsed)) return parsed;
      if (field.fieldType === 11 && parsed && typeof parsed === 'object' && !Array.isArray(parsed))
        return parsed;
    } catch {
      return value;
    }
  }
  return value;
}

export function typedRepeatableValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function updateTypedRepeatableValue(value: unknown, index: number, next: unknown): string {
  const entries = [...typedRepeatableValues(value)];
  while (entries.length <= index) entries.push('');
  entries[index] = next;
  return JSON.stringify(entries);
}

export function removeTypedRepeatableValue(value: unknown, index: number): string {
  return JSON.stringify(
    typedRepeatableValues(value).filter((_entry, position) => position !== index)
  );
}

export function hasProfileValue(value: unknown): boolean {
  const parsed = value;
  if (parsed == null || (typeof parsed === 'string' && !parsed.trim())) return false;
  if (Array.isArray(parsed)) return parsed.some(hasProfileValue);
  if (typeof parsed === 'object') return Object.values(parsed).some(hasProfileValue);
  return true;
}

export function profileFieldValue(
  field: AdmissionFormField,
  value: unknown,
  resolvedOptions?: AdmissionFormOption[]
): string {
  const parsed = [7, 11].includes(field.fieldType) ? decodeProfileValue(value) : value;
  if (parsed == null || parsed === '') return 'Not provided';
  const { format } = parseFieldConfiguration(field.validationJson);
  if (format && ['country', 'state', 'city'].includes(format)) {
    const location = decodeProfileValue(value);
    if (
      typeof location === 'object' &&
      location !== null &&
      'name' in location &&
      typeof location.name === 'string' &&
      location.name.trim()
    )
      return location.name;
  }
  if (format === 'photo') return 'Photo captured at admission';
  if (field.fieldType === 10) return 'File captured at admission';
  if (typeof parsed === 'boolean') return parsed ? 'Yes' : 'No';
  if (field.fieldType === 9)
    return String(parsed).toLowerCase() === 'true'
      ? 'Yes'
      : String(parsed).toLowerCase() === 'false'
        ? 'No'
        : String(parsed);
  if (field.fieldType === 5 && typeof parsed === 'string') return fDate(parsed) ?? 'Not provided';
  const choices = resolvedOptions ?? parseEditableAdmissionChoices(field.optionsJson).choices;
  if (Array.isArray(parsed))
    return (
      parsed
        .map((item) =>
          profileFieldValue(
            { ...field, fieldType: field.fieldType === 7 ? 6 : field.fieldType },
            item,
            resolvedOptions
          )
        )
        .join(', ') || 'Not provided'
    );
  if (typeof parsed === 'object') return recordDiffValue(field.code, parsed);
  const source = parseRuntimeOptionsSource(field.optionsJson);
  return (
    choices.find((choice) => choice.value === String(parsed))?.label ??
    (isAdmissionSiblingField(field)
      ? 'Student unavailable'
      : source
        ? 'Option unavailable'
        : String(parsed))
  );
}

export const profileFieldOptions = (
  source: RecordRegistrationSource,
  code: string,
  index?: number
) =>
  (index == null ? undefined : source.optionsByFieldPath?.[`${code}[${index}]`]) ??
  source.optionsByField?.[code];

export type VisibleProfileSection = {
  section: AdmissionFormSection;
  entryIndex?: number;
  fields: { field: AdmissionFormField; value: unknown }[];
};
export function profileSectionRowValues(
  section: AdmissionFormSection,
  values: Record<string, unknown>,
  index?: number
) {
  if (!section.isRepeatable || index == null) return values;
  const rowFields = new Set(section.fields.map((field) => field.code));
  return Object.fromEntries(
    Object.entries(values).map(([code, value]) => [
      code,
      rowFields.has(code) ? typedRepeatableValues(value)[index] : value,
    ])
  );
}
export function visibleRegistrationSections(
  source: RecordRegistrationSource,
  original = false,
  capturedOnly = false,
  includeEmpty = false,
  includeStatic = false
): VisibleProfileSection[] {
  if (!source.definition) return [];
  const values = original ? source.originalValues : source.currentValues;
  const allValues = profileRuleValues(values);
  const captured = new Set(source.capturedFieldCodes ?? source.editableFieldCodes ?? []);
  return [...source.definition.sections]
    .sort(
      (a, b) =>
        (includeStatic ? (a.stepDisplayOrder ?? 0) - (b.stepDisplayOrder ?? 0) : 0) ||
        a.displayOrder - b.displayOrder
    )
    .flatMap((section) => {
      if (
        !isAdmissionRuleVisible(section.stepVisibilityRuleJson, allValues) ||
        !isAdmissionRuleVisible(section.visibilityRuleJson, allValues)
      )
        return [];
      const fields = section.fields.filter(
        (field) =>
          (includeStatic || field.fieldType !== 12) && (!capturedOnly || captured.has(field.code))
      );
      const count = section.isRepeatable
        ? Math.max(
            0,
            ...fields.map((field) => {
              const value = decodeProfileValue(values[field.code]);
              return Array.isArray(value) ? value.length : 0;
            })
          )
        : 1;
      return Array.from({ length: count }, (_, index) => {
        const rowValues = profileSectionRowValues(
          section,
          values,
          section.isRepeatable ? index : undefined
        );
        return {
          section,
          entryIndex: section.isRepeatable ? index : undefined,
          fields: fields
            .filter((field) =>
              isAdmissionRuleVisible(field.visibilityRuleJson, profileRuleValues(rowValues))
            )
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map((field) => ({ field, value: rowValues[field.code] })),
        };
      }).filter(
        (entry) =>
          entry.fields.length > 0 &&
          (includeEmpty || entry.fields.some(({ value }) => hasProfileValue(value)))
      );
    });
}

const TECHNICAL_FIELDS =
  /^(id|studentId|studentEnrollmentId|tenantId|concurrencyStamp|extraProperties|creationTime|creatorId|lastModificationTime|lastModifierId|isDeleted|deleterId|deletionTime|profilePictureUrl|photoBlobName|formNumber|inquiryPreferenceId|academicMediumId|standardId|divisionId)$/;
export function structuredProfileEntries(
  data?: Record<string, unknown> | null
): { label: string; value: string }[] {
  return Object.entries(data ?? {})
    .filter(([key, value]) => !TECHNICAL_FIELDS.test(key) && hasProfileValue(value))
    .map(([key, value]) => ({
      label: recordFieldLabel(key),
      value:
        ['country', 'state'].includes(key) &&
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        typeof value.name === 'string'
          ? value.name
          : recordDiffValue(key, value),
    }));
}

export function customProfileValidationErrors(
  source: RecordRegistrationSource,
  initial: Record<string, unknown>,
  next: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};
  const editable = new Set(source.editableFieldCodes);
  const originalVisible = new Set(
    visibleRegistrationSections({ ...source, currentValues: initial }, false, true, true).flatMap(
      (entry) =>
        entry.fields.map(
          ({ field }) => field.code + (entry.entryIndex == null ? '' : `[${entry.entryIndex}]`)
        )
    )
  );
  const changed = (code: string) =>
    profileRuleValues({ value: initial[code] }).value !==
    profileRuleValues({ value: next[code] }).value;
  const changedCell = (code: string, index?: number) =>
    index == null
      ? changed(code)
      : JSON.stringify(typedRepeatableValues(initial[code])[index]) !==
        JSON.stringify(typedRepeatableValues(next[code])[index]);
  visibleRegistrationSections({ ...source, currentValues: next }, false, true, true).forEach(
    ({ section, entryIndex, fields }) => {
      const row = profileSectionRowValues(section, next, entryIndex);
      const initialRow = profileSectionRowValues(section, initial, entryIndex);
      const relevant = fields.filter(
        ({ field }) =>
          editable.has(field.code) &&
          (changedCell(field.code, entryIndex) ||
            (Boolean(field.requiredRuleJson) &&
              !isAdmissionRuleVisible(field.requiredRuleJson, profileRuleValues(initialRow)) &&
              isAdmissionRuleVisible(field.requiredRuleJson, profileRuleValues(row))) ||
            !originalVisible.has(field.code + (entryIndex == null ? '' : `[${entryIndex}]`)))
      );
      const validationValues = profileRuleValues(row);
      relevant.forEach(({ field }) => {
        if (
          [7, 11].includes(field.fieldType) &&
          !hasProfileValue(decodeProfileValue(row[field.code]))
        )
          validationValues[field.code] = '';
      });
      const rowErrors = getDynamicAdmissionValidationErrors(
        { sections: [{ fields: relevant.map(({ field }) => field) }] },
        validationValues
      );
      Object.entries(rowErrors).forEach(([code, message]) => {
        if (typeof message === 'string')
          errors[code + (entryIndex == null ? '' : `[${entryIndex}]`)] = message;
      });
      if (section.isRepeatable)
        relevant.forEach(({ field }) => {
          if (!changed(field.code)) return;
          const count = typedRepeatableValues(next[field.code]).length;
          if (count < (section.minEntries ?? 0))
            errors[field.code] = `Add at least ${section.minEntries} entries.`;
          if (count > (section.maxEntries ?? 1))
            errors[field.code] = `Add no more than ${section.maxEntries ?? 1} entries.`;
        });
    }
  );
  // An empty repeated section has no rows, but its collection minimum still applies when changed.
  source.definition?.sections
    .filter(
      (section) =>
        section.isRepeatable &&
        isAdmissionRuleVisible(section.stepVisibilityRuleJson, profileRuleValues(next)) &&
        isAdmissionRuleVisible(section.visibilityRuleJson, profileRuleValues(next))
    )
    .forEach((section) =>
      section.fields
        .filter((field) => editable.has(field.code) && changed(field.code))
        .forEach((field) => {
          if (typedRepeatableValues(next[field.code]).length < (section.minEntries ?? 0))
            errors[field.code] = `Add at least ${section.minEntries} entries.`;
        })
    );
  return errors;
}
