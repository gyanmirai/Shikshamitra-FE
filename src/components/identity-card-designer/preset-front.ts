import { text, presetHeader } from './preset-header';

import type { IdentityCardElement } from './types';

export function presetFront(staff: boolean, themeColor: string): IdentityCardElement[] {
  return [
    ...presetHeader(staff, themeColor),
    {
      id: 'divider',
      type: 'line',
      x: 19,
      y: 94,
      w: 390,
      h: 1,
      z: 1,
      visible: true,
      style: { backgroundColor: themeColor },
    } as IdentityCardElement,
    {
      id: 'photo',
      type: 'photo',
      x: 19,
      y: 104,
      w: staff ? 96 : 84,
      h: 96,
      z: 1,
      visible: true,
      style: { photoShape: staff ? 'circle' : 'rounded', borderColor: '#C4CDD5', borderWidth: 1 },
    } as IdentityCardElement,
    text(
      'person-name',
      staff ? 'name' : 'StudentName',
      'Name',
      staff ? 132 : 120,
      105,
      staff ? 277 : 289,
      25,
      20,
      { fontWeight: 700 }
    ),
    text(
      'person-role',
      staff ? 'designation' : 'Class',
      staff ? 'Designation' : 'Class',
      staff ? 132 : 120,
      134,
      staff ? 277 : 289,
      18,
      12,
      { color: themeColor }
    ),
    text(
      'record-number',
      staff ? 'employeeCode' : 'GRNumber',
      staff ? 'Employee code' : 'GR number',
      staff ? 132 : 120,
      staff ? 159 : 156,
      staff ? 277 : 289,
      18,
      staff ? 11 : 12.5,
      { showLabel: true, separator: ': ' }
    ),
    text(
      'division',
      staff ? 'department' : 'Division',
      staff ? 'Department' : 'Division',
      staff ? 132 : 120,
      staff ? 179 : 176,
      staff ? 277 : 289,
      18,
      staff ? 11 : 12.5,
      { showLabel: true, separator: ': ' }
    ),
    text(
      'additional-record',
      staff ? 'organization' : 'AcademicYear',
      staff ? 'Organization' : 'Academic year',
      staff ? 132 : 120,
      staff ? 195 : 196,
      staff ? 277 : 289,
      staff ? 12 : 16,
      staff ? 10 : 12.5,
      { showLabel: true, separator: ': ' }
    ),
    {
      id: 'footer-divider',
      type: 'line',
      x: 19,
      y: staff ? 207 : 216,
      w: 390,
      h: 1,
      z: 1,
      visible: true,
      style: { backgroundColor: staff ? themeColor : '#DFE3E8' },
    } as IdentityCardElement,
    text(
      'card-number',
      staff ? 'employeeCode' : 'CardNumber',
      'Card number',
      19,
      221,
      307,
      18,
      12,
      { fontWeight: 700 }
    ),
    ...(staff
      ? [
          text('validity', 'validityYear', 'Validity', 19, 242, 307, 14, 10, {
            showLabel: true,
            separator: ': ',
          }),
        ]
      : []),
    {
      id: 'qr',
      type: 'qr',
      x: 363,
      y: 219,
      w: 44,
      h: 44,
      z: 2,
      visible: true,
    } as IdentityCardElement,
  ];
}
