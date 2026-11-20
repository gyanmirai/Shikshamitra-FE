import { it, expect } from 'vitest';

import { buildAdmissionPrintDocument } from './form-print-model';
import { collectAdvancedPrintPhotos } from './form-print-advanced-layout';

it('keeps unique gallery identity and captions for repeated photographs without changing source fields', () => {
  const model = buildAdmissionPrintDocument({ definition: { name: 'Registration', sections: [{ id: 'family', code: 'FAMILY', name: 'Family', displayOrder: 0, isRepeatable: true, minEntries: 2, entryLabel: 'Child', fields: [{ id: 'photo', code: 'PHOTO', label: 'Photograph', fieldType: 0, bindingType: 1, required: false, readOnly: false, displayOrder: 0, validationJson: '{"format":"photo"}' }] }] }, values: {}, mode: 'blank' });
  const photos = collectAdvancedPrintPhotos(model);
  expect(new Set(photos.map((field) => field.key)).size).toBe(2);
  expect(photos.map((field) => field.label)).toEqual(['Child 1: Photograph', 'Child 2: Photograph']);
  expect(model.steps[0].sections[0].entries.map((entry) => entry.fields[0].label)).toEqual(['Photograph', 'Photograph']);
});
