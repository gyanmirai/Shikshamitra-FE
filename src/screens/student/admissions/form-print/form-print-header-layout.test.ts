import { it, expect } from 'vitest';

import { buildAdmissionPrintDocument } from './form-print-model';
import { getAdmissionPrintHeaderElements } from './form-print-header-layout';

it('uses printable width for a horizontal address and leaves room for it above the title', () => {
  const model = buildAdmissionPrintDocument({
    definition: { name: 'Registration', sections: [] },
    values: {},
    mode: 'blank',
    settings: { advanced: { header: { addressLayout: 'horizontal' } } },
  });
  const branding = {
    addressLines: [
      'Building 12\nEducation Campus',
      '   ',
      'A long school address that wraps when placed in the printable header '.repeat(4).trim(),
    ],
  };
  const { elements } = getAdmissionPrintHeaderElements(model, branding);
  const address = elements.find(({ key }) => key === 'address')!;
  const title = elements.find(({ key }) => key === 'title')!;
  expect(address.text).toMatch(/^Building 12, Education Campus, A long school address/);
  expect(address.text).not.toMatch(/[\r\n]/);
  expect(address.placement.width).toBe(100);
  expect(address.placement.y + address.placement.height).toBeCloseTo(title.placement.y);
});

it('keeps movable header elements within the same printable frame', () => {
  const model = buildAdmissionPrintDocument({
    definition: { name: 'Registration', sections: [] },
    values: {},
    mode: 'blank',
    settings: {
      advanced: {
        header: {
          alignment: 'left',
          layout: {
            title: { x: 45, y: 100, width: 1, height: 1 },
          },
        },
      },
    },
  });
  const branding = { schoolName: 'Example Institute', addressLines: ['Surat'] };
  const layout = getAdmissionPrintHeaderElements(model, branding);
  const title = layout.elements.find((item) => item.key === 'title')!;
  expect(title.text).toBe('Registration');
  expect(title.placement.x).toBe(45);
  expect(title.placement.width).toBeGreaterThan(1);
  expect(title.placement.y + title.placement.height).toBeCloseTo(100);
  expect(layout.elements.some((item) => item.key === 'schoolName')).toBe(true);
  expect(layout.elements.some((item) => item.key === 'logo')).toBe(false);
  expect(layout.elements.some((item) => item.key === 'photo')).toBe(false);
});
