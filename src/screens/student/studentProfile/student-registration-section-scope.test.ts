import { it, expect } from 'vitest';

import { studentRegistrationSectionScope } from './student-registration-section-scope';
import { customField, customSource, customSection } from './student-custom-details-test-fixture';

it('includes permitted transitive dependencies across sections without adding unrelated fields', () => {
  const source = customSource(
    [
      customSection([customField('country')], { id: 'country' }),
      customSection(
        [
          customField('state', 6, {
            optionsJson: JSON.stringify({ source: 'States', parentField: 'country' }),
          }),
          customField('city', 6, {
            optionsJson: JSON.stringify({ source: 'Cities', parentField: 'state' }),
          }),
          customField('unrelated'),
        ],
        { id: 'region' }
      ),
    ],
    {},
    { formEditableFieldCodes: ['country', 'state', 'city', 'unrelated'] }
  );
  expect(studentRegistrationSectionScope(source, 'country')).toEqual({
    codes: ['country', 'state', 'city'],
    sectionIds: ['country', 'region'],
  });
  source.formEditableFieldCodes = ['country', 'city'];
  expect(studentRegistrationSectionScope(source, 'country').codes).toEqual(['country', 'city']);
});
