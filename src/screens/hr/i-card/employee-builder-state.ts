import type { EmployeeICardTemplate } from 'src/redux/hr/employee-icard-template-api';

import { createIdentityCardPreset } from 'src/components/identity-card-designer';

import {
  parseLayoutJson,
  type ICardLayout,
  migrateFieldsToLayout,
  DEFAULT_PRINT_SETTINGS,
  parsePrintSettingsJson,
  type ICardPrintSettings,
} from './i-card-builder-utils';

export type ICardFieldKey =
  | 'name'
  | 'employeeCode'
  | 'designation'
  | 'department'
  | 'organization'
  | 'contactNo'
  | 'bloodGroup'
  | 'photo'
  | 'validityYear'
  | 'address';

export type ICardField = {
  name: ICardFieldKey;
  label: string;
  enabled: boolean;
  important?: boolean;
};

export type BuilderState = {
  name: string;
  organization: string;
  orientation: 'Horizontal' | 'Vertical';
  width: number;
  height: number;
  schoolName: string;
  schoolAddress: string;
  logoBlobName: string | null;
  logoMode: 0 | 1 | 2;
  logoPreview: string;
  themeColor: string;
  backgroundColor: string;
  presetKey: string;
  qrCodeEnabled: boolean;
  barcodeEnabled: boolean;
  backSideEnabled: boolean;
  isActive: boolean;
  fields: ICardField[];
  layout: ICardLayout;
  printSettings: ICardPrintSettings;
  selectedEmployeeIds: string[];
  employeeSearch: string;
  designationFilter: string;
  excludeIncompleteEmployees: boolean;
  cardsPerPage: number;
};

const CARD_DIMENSIONS = {
  Horizontal: { width: 420, height: 260 },
  Vertical: { width: 280, height: 420 },
} as const;

export const defaultFields: ICardField[] = [
  { name: 'photo', label: 'Photo', enabled: true, important: true },
  { name: 'name', label: 'Staff Name', enabled: true, important: true },
  { name: 'employeeCode', label: 'Staff Code', enabled: true, important: true },
  { name: 'designation', label: 'Designation', enabled: true },
  { name: 'department', label: 'Department', enabled: true },
  { name: 'organization', label: 'Organization', enabled: true },
  { name: 'contactNo', label: 'Contact Number', enabled: false },
  { name: 'bloodGroup', label: 'Blood Group', enabled: false },
  { name: 'validityYear', label: 'Validity Year', enabled: true },
  { name: 'address', label: 'Address', enabled: false },
];

export const initialBuilder = (academicYearName?: string, organization = 'all'): BuilderState => {
  const layout = createIdentityCardPreset('staff-professional');
  return {
    name: 'Staff I-Card',
    organization,
    orientation: 'Horizontal',
    width: layout.width,
    height: layout.height,
    schoolName: '',
    schoolAddress: '',
    logoBlobName: null,
    logoMode: 0,
    logoPreview: '',
    themeColor: layout.themeColor,
    backgroundColor: layout.backgroundColor,
    presetKey: 'staff-professional',
    qrCodeEnabled: true,
    barcodeEnabled: false,
    backSideEnabled: true,
    isActive: true,
    fields: defaultFields,
    layout,
    printSettings: DEFAULT_PRINT_SETTINGS,
    selectedEmployeeIds: [],
    employeeSearch: '',
    designationFilter: 'all',
    excludeIncompleteEmployees: false,
    cardsPerPage: 8,
  };
};

const parseFields = (template?: EmployeeICardTemplate | null) => {
  const mandatoryFields = new Set(['photo', 'name', 'employeeCode']);
  const disabledFields = defaultFields.map((field) => ({
    ...field,
    enabled: mandatoryFields.has(field.name),
  }));

  if (!template?.fieldsJson) return defaultFields;
  try {
    const parsed = JSON.parse(template.fieldsJson);
    if (!Array.isArray(parsed)) return disabledFields;
    return disabledFields.map((field) => ({
      ...field,
      enabled:
        field.important ||
        (parsed.find((item: ICardField) => item.name === field.name)?.enabled ?? field.enabled),
    }));
  } catch {
    return disabledFields;
  }
};

export const buildTemplateState = (
  template: EmployeeICardTemplate | null,
  academicYearName?: string,
  organization = 'all'
): BuilderState => {
  if (!template) return initialBuilder(academicYearName, organization);

  const orientation = template.orientation === 'Vertical' ? 'Vertical' : 'Horizontal';
  const defaultSize = CARD_DIMENSIONS[orientation];
  const fields = parseFields(template);
  const layout =
    parseLayoutJson(template.layoutJson) ||
    migrateFieldsToLayout(fields, {
      orientation,
      width: template.width || defaultSize.width,
      height: template.height || defaultSize.height,
      themeColor: template.themeColor || '#1D4ED8',
      backgroundColor: template.backgroundColor || '#F8FAFC',
      qrCodeEnabled: Boolean(template.qrCodeEnabled),
      barcodeEnabled: Boolean(template.barcodeEnabled),
    });
  const enabled = new Set(fields.filter((field) => field.enabled).map((field) => field.name));
  const applyLegacyFieldVisibility = (element: ICardLayout['front']['elements'][number]) =>
    element.fieldKey &&
    defaultFields.some((field) => field.name === element.fieldKey) &&
    !enabled.has(element.fieldKey as ICardFieldKey)
      ? { ...element, visible: false }
      : element;
  const adaptedLayout =
    (template.schemaVersion ?? 1) < 2
      ? {
          ...layout,
          front: { elements: layout.front.elements.map(applyLegacyFieldVisibility) },
          back: layout.back && { elements: layout.back.elements.map(applyLegacyFieldVisibility) },
        }
      : layout;

  return {
    ...initialBuilder(academicYearName, template.mediumStageId || 'all'),
    name: template.name,
    orientation: layout.orientation,
    width: layout.width,
    height: layout.height,
    schoolName: template.schoolName || template.name,
    schoolAddress: template.schoolAddress || '',
    logoBlobName: template.logoBlobName || null,
    logoMode: template.logoMode ?? (template.logoBlobName ? 1 : 0),
    logoPreview: '',
    themeColor: layout.themeColor,
    backgroundColor: layout.backgroundColor,
    presetKey: template.presetKey || layout.presetKey || 'formal-staff',
    qrCodeEnabled: Boolean(template.qrCodeEnabled),
    barcodeEnabled: Boolean(template.barcodeEnabled),
    backSideEnabled: Boolean(template.backSideEnabled),
    isActive: template.isActive,
    fields,
    layout: adaptedLayout,
    printSettings: parsePrintSettingsJson(template.printSettingsJson),
  };
};

export function getEmployeeCardDesignPayload(state: BuilderState) {
  const visibleBindings = new Set(
    [
      ...state.layout.front.elements,
      ...(state.backSideEnabled ? (state.layout.back?.elements ?? []) : []),
    ]
      .filter((element) => element.visible)
      .map((element) => (element.type === 'photo' ? 'photo' : element.fieldKey))
  );
  return {
    width: state.layout.width,
    height: state.layout.height,
    orientation: state.layout.orientation,
    themeColor: state.layout.themeColor,
    backgroundColor: state.layout.backgroundColor,
    presetKey: state.layout.presetKey || state.presetKey,
    schemaVersion: 2,
    layoutJson: JSON.stringify(state.layout),
    printSettingsJson: JSON.stringify({ ...state.printSettings, units: 'mm' }),
    fieldsJson: JSON.stringify(
      state.fields.map((field) => ({
        ...field,
        enabled: Boolean(field.important || visibleBindings.has(field.name)),
      }))
    ),
  };
}

export function getEmployeeCardDraftSignature(state: BuilderState) {
  return JSON.stringify({
    ...state,
    logoPreview: '',
    employeeSearch: '',
    designationFilter: 'all',
  });
}
