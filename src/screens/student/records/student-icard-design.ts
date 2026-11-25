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

const studentDataFields: IdentityCardFieldOption[] = [
  { key: 'StudentName', label: 'Student Name', group: 'Student Info' },
  { key: 'GRNumber', label: 'GR Number', group: 'Student Info' },
  { key: 'Class', label: 'Class', group: 'Student Info' },
  { key: 'Division', label: 'Division', group: 'Student Info' },
  { key: 'RollNo', label: 'Roll No', group: 'Student Info' },
  { key: 'DateOfBirth', label: 'Date of birth (DOB)', group: 'Student Info' },
  { key: 'AcademicYear', label: 'Academic Year', group: 'Contact/School' },
];

export const STUDENT_ICARD_FIELDS: IdentityCardFieldOption[] = [
  ...studentDataFields,
  { key: 'schoolName', label: 'School name', group: 'Contact/School' },
  { key: 'schoolAddress', label: 'School address', group: 'Contact/School' },
  { key: 'CardNumber', label: 'Card number', group: 'Card Details' },
  { key: 'headerText', label: 'Card heading', group: 'Card Details' },
  { key: 'footerText', label: 'Return instructions', group: 'Card Details' },
];

export const STUDENT_ICARD_TOKENS = Object.fromEntries(
  studentDataFields.map(({ key, label }) => [key, label])
);
const studentKeys = new Set(studentDataFields.map((field) => field.key));

function getCardDimensions(
  orientation: IdCardTemplate['orientation'],
  widthMm = 85.6,
  heightMm = 53.98
) {
  const shortEdge = Math.min(widthMm, heightMm);
  const longEdge = Math.max(widthMm, heightMm);
  return orientation === 'Vertical'
    ? { widthMm: shortEdge, heightMm: longEdge }
    : { widthMm: longEdge, heightMm: shortEdge };
}

export function getStudentICardLayout(template: IdCardTemplate): IdentityCardLayout {
  const saved = readStudentICardLayout(template);
  if (saved) return saved;
  const layout = createIdentityCardPreset('classic-identity', {
    ...getCardDimensions(template.orientation),
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

export function hasStudentICardSignatureLayer(layout: IdentityCardLayout) {
  return [layout.front, layout.back].some((side) =>
    side?.elements.some((element) => element.type === 'signature')
  );
}

export function createStudentICardTemplate(
  orientation: IdCardTemplate['orientation'] = 'Horizontal'
): IdCardTemplate {
  const template: IdCardTemplate = {
    name: '',
    presetKey: 'classic-identity',
    orientation,
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
  return applyStudentICardDesign(
    template,
    createIdentityCardPreset('classic-identity', getCardDimensions(orientation)),
    { ...DEFAULT_IDENTITY_CARD_PRINT_SETTINGS }
  );
}

export function setStudentICardOrientation(
  template: IdCardTemplate,
  orientation: IdCardTemplate['orientation']
): IdCardTemplate {
  if (template.orientation === orientation) return template;
  if (template.schemaVersion !== 2) return { ...template, orientation };

  const layout = readStudentICardLayout(template);
  if (!layout) return template;

  const isStarterLayout =
    template.layoutJson === createStudentICardTemplate(layout.orientation).layoutJson;
  const dimensions =
    layout.widthMm === layout.heightMm && orientation === 'Vertical'
      ? getCardDimensions(orientation)
      : getCardDimensions(orientation, layout.widthMm, layout.heightMm);
  const layoutJson = isStarterLayout
    ? createStudentICardTemplate(orientation).layoutJson
    : JSON.stringify({ ...layout, ...dimensions, orientation });
  return { ...template, orientation, layoutJson };
}

export function getStudentICardDesignErrors(template: IdCardTemplate): string[] {
  if (template.schemaVersion !== 2) return [];
  const layout = readStudentICardLayout(template);
  if (!layout)
    return ['The saved card design is invalid. Choose Classic Identity to reset the design.'];
  const errors = validateIdentityCardLayout(layout, STUDENT_ICARD_FIELDS);
  if (template.signature?.mode === 1) {
    if (!template.signature.assetId) errors.push('Upload the custom principal’s signature.');
    else if (!template.signature.principalName?.trim() || !template.signature.designation?.trim())
      errors.push('Enter the principal’s name and designation for the custom signature.');
  }
  if (template.backSideEnabled && !layout.back?.elements.length)
    errors.push('Add a back design or disable the back side.');
  return [
    ...errors,
    ...getIdentityCardSheetLayout(layout, getStudentICardPrintSettings(template)).errors,
  ];
}
