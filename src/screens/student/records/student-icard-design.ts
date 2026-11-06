import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';
import type {
  IdentityCardLayout,
  IdentityCardFieldOption,
  IdentityCardPrintSettings,
} from 'src/components/identity-card-designer';

import {
  createIdentityCardPreset,
  getIdentityCardSheetLayout,
  validateIdentityCardLayout,
  DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
} from 'src/components/identity-card-designer';

import { readStudentICardLayout, getStudentICardPrintSettings } from './student-icard-json';

export { readStudentICardLayout, getStudentICardPrintSettings } from './student-icard-json';

export const STUDENT_ICARD_FIELDS: IdentityCardFieldOption[] = [
  { key: 'StudentName', label: 'Student name' },
  { key: 'GRNumber', label: 'GR number' },
  { key: 'Class', label: 'Class' },
  { key: 'Division', label: 'Division' },
  { key: 'AcademicYear', label: 'Academic year' },
  { key: 'DateOfBirth', label: 'Date of birth' },
  { key: 'CardNumber', label: 'Card number' },
  { key: 'schoolName', label: 'School name' },
  { key: 'schoolAddress', label: 'School address' },
  { key: 'headerText', label: 'Card heading' },
  { key: 'footerText', label: 'Return instructions' },
];

const studentKeys = new Set(STUDENT_ICARD_FIELDS.slice(0, 6).map((field) => field.key));

export function getStudentICardLayout(template: IdCardTemplate): IdentityCardLayout {
  const saved = readStudentICardLayout(template);
  if (saved) return saved;
  const vertical = template.orientation === 'Vertical';
  const layout =
    saved ??
    createIdentityCardPreset('classic-identity', {
      widthMm: vertical ? 53.98 : 85.6,
      heightMm: vertical ? 85.6 : 53.98,
      themeColor: template.primaryColor,
      backgroundColor: template.backgroundColor,
    });
  const map = (element: IdentityCardLayout['front']['elements'][number]) => ({
    ...element,
    visible:
      element.visible &&
      (element.type !== 'photo' || template.showPhoto) &&
      (!element.fieldKey ||
        !studentKeys.has(element.fieldKey) ||
        template.fields.includes(element.fieldKey)),
  });
  return {
    ...layout,
    front: { elements: layout.front.elements.map(map) },
    back: layout.back ? { elements: layout.back.elements.map(map) } : undefined,
  };
}

export function applyStudentICardDesign(
  template: IdCardTemplate,
  layout: IdentityCardLayout,
  printSettings: IdentityCardPrintSettings
): IdCardTemplate {
  const elements = [
    ...layout.front.elements,
    ...(template.backSideEnabled ? (layout.back?.elements ?? []) : []),
  ];
  return {
    ...template,
    schemaVersion: 2,
    presetKey: 'classic-identity',
    layoutJson: JSON.stringify(layout),
    printSettingsJson: JSON.stringify(printSettings),
    orientation: layout.orientation,
    primaryColor: layout.themeColor,
    backgroundColor: layout.backgroundColor,
    cardsPerPage: printSettings.cardsPerPage,
    showPhoto: elements.some((element) => element.type === 'photo' && element.visible),
    fields: [
      ...new Set(
        elements
          .filter(
            (element) => element.visible && element.fieldKey && studentKeys.has(element.fieldKey)
          )
          .map((element) => element.fieldKey!)
      ),
    ],
  };
}

export function createStudentICardTemplate(): IdCardTemplate {
  const template: IdCardTemplate = {
    name: '',
    presetKey: 'classic-identity',
    orientation: 'Horizontal',
    schoolName: '',
    schoolAddress: '',
    headerText: 'Student Identity Card',
    footerText: 'Please return this card to the school if found.',
    primaryColor: '#007867',
    backgroundColor: '#FFFFFF',
    cardsPerPage: 8,
    showQrCode: true,
    showPhoto: true,
    backSideEnabled: true,
    fields: ['StudentName', 'GRNumber', 'Class', 'Division', 'AcademicYear'],
  };
  return applyStudentICardDesign(template, createIdentityCardPreset('classic-identity'), {
    ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS,
  });
}

export function getStudentICardDesignErrors(template: IdCardTemplate): string[] {
  if (template.schemaVersion !== 2) return [];
  const layout = readStudentICardLayout(template);
  if (!layout)
    return ['The saved card design is invalid. Choose Classic Identity to reset the design.'];
  const errors = validateIdentityCardLayout(layout, STUDENT_ICARD_FIELDS);
  if (template.backSideEnabled && !layout.back?.elements.length)
    errors.push('Add a back design or disable the back side.');
  return [
    ...errors,
    ...getIdentityCardSheetLayout(layout, getStudentICardPrintSettings(template)).errors,
  ];
}
