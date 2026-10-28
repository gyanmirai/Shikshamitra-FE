import { it, expect, describe } from 'vitest';

import {
  getDependentAdmissionFieldCodes,
  dependentAdmissionFieldValues,
} from './admission-field-dependencies';

describe('admission location dependencies', () => {
  it('clears only the affected repeatable academic row', () => {
    const fields = [
      { code: 'CLASS', fieldType: 6 },
      { code: 'DIVISION', fieldType: 6 },
    ];
    expect(
      dependentAdmissionFieldValues(fields, 'CLASS', { DIVISION: '["lotus","rose"]' }, 1, [
        'CLASS',
        'DIVISION',
      ])
    ).toEqual({ DIVISION: '["lotus",""]' });
    expect(
      dependentAdmissionFieldValues(fields, 'CLASS', { DIVISION: '["lotus","rose"]' })
    ).toEqual({ DIVISION: '' });
  });
  it('clears academic descendants without clearing unrelated fields or looping through cycles', () => {
    const academicFields = [
      { code: 'BOARD', optionsJson: '{"source":"EducationBoards"}' },
      { code: 'MEDIUM', optionsJson: '{"source":"EducationMediums","parentField":"BOARD"}' },
      { code: 'CLASS', optionsJson: '{"source":"StandardsByMedium","parentField":"MEDIUM"}' },
      { code: 'DIVISION', optionsJson: '{"source":"DivisionsByStandard","parentField":"CLASS"}' },
      { code: 'NAME', optionsJson: null },
    ];
    expect(getDependentAdmissionFieldCodes(academicFields, 'BOARD')).toEqual([
      'MEDIUM',
      'CLASS',
      'DIVISION',
    ]);
    expect(getDependentAdmissionFieldCodes(academicFields, 'CLASS')).toEqual(['DIVISION']);
    expect(
      getDependentAdmissionFieldCodes(
        [
          { code: 'CLASS', optionsJson: '{"source":"Standards","parentField":"DIVISION"}' },
          {
            code: 'DIVISION',
            optionsJson: '{"source":"DivisionsByStandard","parentField":"CLASS"}',
          },
        ],
        'CLASS'
      )
    ).toEqual(['DIVISION']);
  });

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
