import { it, expect, describe } from 'vitest';

import { getDirectRegistrationSchema } from './admission-direct-registration-dialog';

describe('direct registration core policy', () => {
  it('keeps historical email optional', async () => {
    await expect(
      getDirectRegistrationSchema().validateAt('guardianEmail', { guardianEmail: '' })
    ).resolves.toBe('');
  });
  it.each([
    ['applicantFirstName', 'First name is required.'],
    ['guardianFirstName', 'Parent name is required.'],
    ['guardianMobile', 'Parent contact number is required.'],
    ['guardianEmail', 'Parent email is required.'],
    ['parentRelationship', 'Select a relationship to student.'],
  ])('requires %s with label-based copy in v1', async (key, message) => {
    await expect(getDirectRegistrationSchema(1).validateAt(key, { [key]: '' })).rejects.toThrow(
      message
    );
  });
});
