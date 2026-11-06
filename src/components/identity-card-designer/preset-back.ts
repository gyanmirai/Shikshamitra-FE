import { text, presetHeader } from './preset-header';

import type { IdentityCardElement } from './types';

export function presetBack(staff: boolean, themeColor: string): IdentityCardElement[] {
  return [
    ...presetHeader(staff, themeColor).map((element) => ({ ...element, id: `back-${element.id}` })),
    {
      ...text(
        'return-instructions',
        staff ? 'static' : 'footerText',
        'Return instructions',
        19,
        108,
        389,
        42,
        12
      ),
      value: 'If found, return this card to the school office.',
    },
    text('office-address', 'schoolAddress', 'School office', 19, 155, 275, 38, 11, {
      showLabel: true,
      separator: '\n',
    }),
    {
      ...text('signature', 'static', 'Signature label', 19, 211, 275, 22, 10),
      value: 'Authorised signatory',
    },
    text(
      'back-validity',
      staff ? 'validityYear' : 'AcademicYear',
      staff ? 'Validity' : 'Academic year',
      19,
      242,
      307,
      14,
      10,
      { showLabel: true, separator: ': ' }
    ),
    {
      id: 'back-qr',
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
