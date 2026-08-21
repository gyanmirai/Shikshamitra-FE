import { it, expect, describe } from 'vitest';

import { getDependentAdmissionFieldCodes } from './admission-field-dependencies';

describe('admission location dependencies', () => {
  const fields = [
    { code: 'COUNTRY', validationJson: '{"format":"country"}' },
    { code: 'STATE', validationJson: '{"format":"state","countryField":"COUNTRY"}' },
    {
      code: 'CITY',
      validationJson: '{"format":"city","countryField":"COUNTRY","stateField":"STATE"}',
    },
  ];

  it('clears state and city after country changes', () => {
    expect(getDependentAdmissionFieldCodes(fields, 'COUNTRY')).toEqual(['STATE', 'CITY']);
  });

  it('clears city after state changes', () => {
    expect(getDependentAdmissionFieldCodes(fields, 'STATE')).toEqual(['CITY']);
  });
});
