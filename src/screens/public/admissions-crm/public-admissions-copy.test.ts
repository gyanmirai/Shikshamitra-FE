import { it, expect, describe } from 'vitest';

import {
  publicAdmissionsCopy,
  publicAdmissionsActionCopy,
  publicAdmissionsStatusCopy,
} from './public-admissions-copy';

describe('public admissions copy', () => {
  it.each(['en', 'gu', 'hi'] as const)(
    'provides complete shell and OTP copy for %s',
    (language) => {
      const copy = publicAdmissionsCopy[language];

      Object.values(copy).forEach((value) => expect(value.trim()).not.toBe(''));
    }
  );

  it('keeps each language visibly distinct', () => {
    expect(new Set(Object.values(publicAdmissionsCopy).map((copy) => copy.statusTitle)).size).toBe(
      3
    );
  });

  it.each(['en', 'gu', 'hi'] as const)('provides parent action copy for %s', (language) => {
    expect(Object.keys(publicAdmissionsActionCopy[language])).toEqual(
      Object.keys(publicAdmissionsActionCopy.en)
    );
    Object.values(publicAdmissionsActionCopy[language]).forEach((value) =>
      expect(value.trim()).not.toBe('')
    );
  });

  it.each(['en', 'gu', 'hi'] as const)('provides complete status copy for %s', (language) => {
    expect(Object.keys(publicAdmissionsStatusCopy[language])).toEqual(
      Object.keys(publicAdmissionsStatusCopy.en)
    );
    Object.values(publicAdmissionsStatusCopy[language]).forEach((value) =>
      expect(value.trim()).not.toBe('')
    );
  });
});
