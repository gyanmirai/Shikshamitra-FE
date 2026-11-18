import type { AdmissionFormSection } from 'src/redux/student/admissions/admission-applications-api';

import { formatDateOnly } from 'src/utils/date-only';

import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';
import { getAdmissionPhotoError } from '../admission-profile-photo';
import { isAdmissionRuleVisible } from '../admission-visibility-rules';
import { localizeAdmissionSection } from '../form-dialog/form-languages';
import { parseFieldConfiguration } from '../form-dialog/form-field-presets';
import { getAdmissionFormStepGroups } from '../form-dialog/form-step-groups';
import { mergeInquiryContextSections } from '../inquiry-context-presentation';
import { readRepeatableValues, getRepeatableEntryCount } from '../form-repeatable-values';

export type AdmissionPrintSettings = {
  template?: 'simple' | 'boxed-grid' | 'structured-classic';
  layout: 'compact' | 'spacious';
  paperSize: 'A4';
  showSchoolHeader: boolean;
  showPhoto: boolean;
  showSignature: boolean;
};

export const DEFAULT_ADMISSION_PRINT_SETTINGS: AdmissionPrintSettings = {
  template: 'simple',
  layout: 'compact',
  paperSize: 'A4',
  showSchoolHeader: true,
  showPhoto: true,
  showSignature: true,
};

/** Structural input shared by saved runtime definitions and unsaved builder drafts. */
type PrintFieldDefinition = Omit<AdmissionFormSection['fields'][number], 'sectionId'> & {
  sectionId?: string;
};
type PrintSectionDefinition = Omit<AdmissionFormSection, 'fields'> & {
  fields: PrintFieldDefinition[];
};

export type AdmissionPrintDefinition = {
  name: string;
  sections: PrintSectionDefinition[];
  layoutType?: number;
  fieldsPerRow?: number;
  defaultLanguage?: string;
  supportedLanguages?: string[];
  printSettings?: Partial<AdmissionPrintSettings> | null;
};

export type AdmissionPrintBranding = {
  schoolName?: string;
  addressLines?: string[];
  logoUrl?: string;
  bannerUrl?: string;
};

export type AdmissionPrintField = {
  key: string;
  code: string;
  label: string;
  value: string;
  kind: 'text' | 'multiline' | 'choice' | 'checkbox' | 'photo' | 'file' | 'static';
  required: boolean;
  conditional?: boolean;
  options?: { value: string; label: string }[];
  imageUrl?: string;
  /** Semantic input metadata; display labels may be renamed or translated. */
  bindingKey?: string;
  writingFormat?: 'line' | 'characters' | 'phone' | 'date' | 'aadhaar' | 'pan';
};

export type AdmissionPrintEntry = {
  key: string;
  label?: string;
  fields: AdmissionPrintField[];
};

export type AdmissionPrintSection = {
  key: string;
  title: string;
  columns: number;
  repeatable: boolean;
  entries: AdmissionPrintEntry[];
};

export type AdmissionPrintStep = {
  key: string;
  code: string;
  title: string;
  sections: AdmissionPrintSection[];
};

export type AdmissionPrintDocument = {
  title: string;
  registrationNumber: string;
  language: string;
  mode: 'blank' | 'filled';
  settings: AdmissionPrintSettings;
  columns: number;
  steps: AdmissionPrintStep[];
  labels: {
    registrationNumber: string;
    date: string;
    photo: string;
    signature: string;
    parentSignature: string;
    officeSignature: string;
    page: string;
    of: string;
    yes: string;
    no: string;
    conditional: string;
    unavailable: string;
  };
};

type BuildInput = {
  definition: AdmissionPrintDefinition;
  /** Values are serialized valueJson strings, never live input/control objects. */
  values: Record<string, string>;
  inquiryContextSections?: PrintSectionDefinition[];
  inquiryContextValues?: Record<string, string>;
  language?: string;
  mode: 'blank' | 'filled';
  stepKey?: string | null;
  settings?: Partial<AdmissionPrintSettings>;
  choiceLabels?: Record<string, Record<string, string>>;
  registrationNumber?: string;
};

const COPY = {
  en: {
    registrationNumber: 'Registration No.',
    date: 'Date',
    photo: 'Photograph',
    signature: 'Signatures',
    parentSignature: 'Parent signature',
    officeSignature: 'School office signature',
    page: 'Page',
    of: 'of',
    yes: 'Yes',
    no: 'No',
    conditional: 'If applicable',
    unavailable: 'Unavailable',
  },
  gu: {
    registrationNumber: 'નોંધણી ક્રમાંક',
    date: 'તારીખ',
    photo: 'ફોટોગ્રાફ',
    signature: 'સહીઓ',
    parentSignature: 'માતા / પિતાની સહી',
    officeSignature: 'શાળાની કચેરીની સહી',
    page: 'પાનું',
    of: 'માંથી',
    yes: 'હા',
    no: 'ના',
    conditional: 'લાગુ પડતું હોય તો',
    unavailable: 'ઉપલબ્ધ નથી',
  },
  hi: {
    registrationNumber: 'पंजीकरण क्रमांक',
    date: 'दिनांक',
    photo: 'फोटोग्राफ',
    signature: 'हस्ताक्षर',
    parentSignature: 'माता / पिता के हस्ताक्षर',
    officeSignature: 'विद्यालय कार्यालय के हस्ताक्षर',
    page: 'पृष्ठ',
    of: 'में से',
    yes: 'हाँ',
    no: 'नहीं',
    conditional: 'यदि लागू हो',
    unavailable: 'उपलब्ध नहीं',
  },
};

function parseValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function runtimeValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function readAnswers(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).map(([code, value]) => [code, runtimeValue(parseValue(value))])
  );
}

function fieldIdentity(field: PrintFieldDefinition) {
  if (field.bindingType === 0 && field.bindingKey)
    return `system:${field.bindingKey.toLowerCase()}`;
  return (
    field.fieldIdentity || field.inheritedFrom?.fieldIdentity || `field:${field.id || field.code}`
  );
}

function readOptions(value?: string | null): { value: string; label: string }[] {
  const options = parseValue(value);
  if (!Array.isArray(options)) return [];
  return options.flatMap((option: unknown) => {
    if (typeof option === 'string') return [{ value: option, label: option }];
    if (!option || typeof option !== 'object') return [];
    const item = option as Record<string, unknown>;
    if (typeof item.value !== 'string' && typeof item.value !== 'number') return [];
    return [{ value: String(item.value), label: String(item.label ?? item.value) }];
  });
}

/** Print known presentation properties only; never leak object IDs, coordinates or file metadata. */
function readableValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return value.map(readableValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;
    const label = item.label ?? item.name ?? item.fileName ?? item.filename;
    if (typeof label === 'string') return label;
    return ['addressLine1', 'addressLine2', 'city', 'state', 'country', 'postalCode', 'pincode']
      .map((key) => readableValue(item[key]))
      .filter(Boolean)
      .join(', ');
  }
  return String(value);
}

function printField(
  field: PrintFieldDefinition,
  value: string,
  mode: BuildInput['mode'],
  labels: AdmissionPrintDocument['labels'],
  choices: Record<string, string> = {},
  conditional = false
): AdmissionPrintField {
  const { format } = parseFieldConfiguration(field.validationJson);
  const kind: AdmissionPrintField['kind'] =
    format === 'photo'
      ? 'photo'
      : field.fieldType === 12
        ? 'static'
        : field.fieldType === 10
          ? 'file'
          : field.fieldType === 9
            ? 'checkbox'
            : [6, 7, 8].includes(field.fieldType) || field.bindingKey === 'Family.SiblingStudentIds'
              ? 'choice'
              : [1, 11].includes(field.fieldType)
                ? 'multiline'
                : 'text';
  const options = readOptions(field.optionsJson);
  const answer = parseValue(value);
  const displayChoices = {
    ...Object.fromEntries(options.map((option) => [option.value, option.label])),
    ...choices,
  };
  let printed = '';
  let imageUrl: string | undefined;
  if (mode === 'filled' && kind === 'photo') {
    if (typeof answer === 'string' && answer && !getAdmissionPhotoError(answer)) imageUrl = answer;
  } else if (mode === 'filled' && kind === 'checkbox') {
    printed = value === '' ? '' : answer === true || answer === 'true' ? labels.yes : labels.no;
  } else if (mode === 'filled' && kind === 'choice') {
    const selected = Array.isArray(answer) ? answer : [answer];
    printed = selected
      .map((item) => {
        const raw = readableValue(item);
        return (
          displayChoices[raw] ??
          (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(raw) ? labels.unavailable : raw)
        );
      })
      .filter(Boolean)
      .join(', ');
  } else if (mode === 'filled' && kind !== 'static') {
    printed =
      field.fieldType === 5 && value
        ? formatDateOnly(typeof answer === 'string' ? answer : '', ADMISSION_DATE_FORMAT)
        : readableValue(answer);
    if (kind === 'file' && typeof answer === 'string' && /^(data:|https?:|\{)/i.test(answer))
      printed = '';
  }
  return {
    key: field.id || field.code,
    ...(field.bindingType === 0 && field.bindingKey ? { bindingKey: field.bindingKey } : {}),
    writingFormat:
      field.fieldType === 5
        ? 'date'
        : format === 'phone' || field.fieldType === 4
          ? 'phone'
          : format === 'aadhaar'
            ? 'aadhaar'
            : format === 'pan'
              ? 'pan'
              : field.bindingType === 0 &&
                  /^(Applicant|Guardian|Father|Mother)\.(FirstName|MiddleName|LastName|Name)$/i.test(
                    field.bindingKey ?? ''
                  )
                ? 'characters'
                : 'line',
    code: field.code,
    label: field.label,
    value: printed,
    kind,
    required: field.required,
    ...(conditional ? { conditional: true } : {}),
    ...(options.length ? { options } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  };
}

export function buildAdmissionPrintDocument({
  definition,
  values,
  inquiryContextSections = [],
  inquiryContextValues = {},
  language = definition.defaultLanguage ?? 'en',
  mode,
  stepKey,
  settings,
  choiceLabels = {},
  registrationNumber,
}: BuildInput): AdmissionPrintDocument {
  const effectiveSettings: AdmissionPrintSettings = {
    ...DEFAULT_ADMISSION_PRINT_SETTINGS,
    ...definition.printSettings,
    ...settings,
    paperSize: 'A4',
  };
  const labels = COPY[language as keyof typeof COPY] ?? COPY.en;
  const answers =
    mode === 'blank' ? {} : { ...readAnswers(values), ...readAnswers(inquiryContextValues) };
  const contextIds = new Set(
    inquiryContextSections.flatMap((section) => section.fields.map((field) => field.id))
  );
  const contextAnswers = mode === 'blank' ? {} : readAnswers(inquiryContextValues);
  const registrationAnswers = mode === 'blank' ? {} : readAnswers(values);
  const sections = mergeInquiryContextSections(definition.sections, inquiryContextSections).map(
    (section) =>
      localizeAdmissionSection(
        {
          ...section,
          // Normalize legacy string choices before the shared localization projection.
          fields: section.fields.map((field) => {
            const options = readOptions(field.optionsJson);
            return options.length ? { ...field, optionsJson: JSON.stringify(options) } : field;
          }),
        },
        language
      )
  );
  const sectionOrder = new Map(sections.map((section, index) => [section.id, index]));
  const groups = getAdmissionFormStepGroups(sections).sort(
    (left, right) =>
      Math.min(...left.sections.map(({ section }) => sectionOrder.get(section.id)!)) -
      Math.min(...right.sections.map(({ section }) => sectionOrder.get(section.id)!))
  );
  const seen = new Set<string>();
  const steps: AdmissionPrintStep[] = [];
  groups.forEach((group) => {
    if (stepKey && stepKey !== group.id && stepKey !== group.code) return;
    if (mode === 'filled' && !isAdmissionRuleVisible(group.visibilityRuleJson, answers)) return;
    const parts: AdmissionPrintSection[] = [];
    group.sections
      .sort(
        (left, right) => sectionOrder.get(left.section.id)! - sectionOrder.get(right.section.id)!
      )
      .forEach(({ section }) => {
        if (
          mode === 'filled' &&
          (!isAdmissionRuleVisible(section.visibilityRuleJson, answers) ||
            !isAdmissionRuleVisible(section.stepVisibilityRuleJson, answers))
        )
          return;
        const uniqueFields = [...section.fields]
          .sort((left, right) => left.displayOrder - right.displayOrder)
          .filter((field) => {
            if (
              !effectiveSettings.showPhoto &&
              parseFieldConfiguration(field.validationJson).format === 'photo'
            )
              return false;
            const identity = fieldIdentity(field);
            if (seen.has(identity)) return false;
            seen.add(identity);
            return true;
          });
        const count = section.isRepeatable
          ? mode === 'blank'
            ? Math.max(1, section.minEntries ?? 0)
            : getRepeatableEntryCount(
                section.fields.map((field) => answers[field.code]),
                section.minEntries
              )
          : 1;
        const entries: AdmissionPrintEntry[] = [];
        for (let index = 0; index < count; index += 1) {
          const rowAnswers = section.isRepeatable
            ? {
                ...answers,
                ...Object.fromEntries(
                  section.fields.map((field) => [
                    field.code,
                    readRepeatableValues(answers[field.code])[index] ?? '',
                  ])
                ),
              }
            : answers;
          const entryFields = uniqueFields
            .filter(
              (field) =>
                mode === 'blank' || isAdmissionRuleVisible(field.visibilityRuleJson, rowAnswers)
            )
            .map((field) => {
              const sourceAnswers = contextIds.has(field.id) ? contextAnswers : registrationAnswers;
              const value = section.isRepeatable
                ? (readRepeatableValues(sourceAnswers[field.code])[index] ?? '')
                : (sourceAnswers[field.code] ?? '');
              return printField(
                field,
                value,
                mode,
                labels,
                { ...choiceLabels[field.code], ...field.translations?.[language]?.choices },
                Boolean(
                  field.visibilityRuleJson ||
                  section.visibilityRuleJson ||
                  section.stepVisibilityRuleJson ||
                  group.visibilityRuleJson
                )
              );
            });
          if (entryFields.length)
            entries.push({
              key: `${section.id}:${index}`,
              ...(section.isRepeatable
                ? { label: `${section.entryLabel || section.name} ${index + 1}` }
                : {}),
              fields: entryFields,
            });
        }
        if (entries.length)
          parts.push({
            key: section.id,
            title: section.name,
            columns: Math.max(1, Math.min(4, section.fieldsPerRow ?? definition.fieldsPerRow ?? 2)),
            repeatable: Boolean(section.isRepeatable),
            entries,
          });
      });
    if (parts.length)
      steps.push({ key: group.id, code: group.code, title: group.name, sections: parts });
  });
  return {
    title: definition.name,
    registrationNumber: mode === 'filled' ? (registrationNumber?.trim() ?? '') : '',
    language,
    mode,
    settings: effectiveSettings,
    columns: Math.max(1, Math.min(4, definition.fieldsPerRow ?? 2)),
    steps,
    labels,
  };
}
