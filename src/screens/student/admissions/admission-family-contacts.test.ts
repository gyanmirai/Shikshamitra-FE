import { it, expect, describe } from 'vitest';

import {
  buildAdmissionFamilyContacts,
  admissionFamilyContactsSchema,
  initialAdmissionFamilyContacts,
} from './admission-family-contacts-model';

describe('admission family contact draft', () => {
  it('requires a guardian-owned contact method when the guardian is the main school contact', async () => {
    await expect(
      admissionFamilyContactsSchema.validate({
        ...initialAdmissionFamilyContacts,
        addGuardian: true,
        guardianFullName: 'Pooja Shah',
        guardianRelationship: 'Aunt',
        guardianMobile: ' ',
        guardianEmail: ' ',
        mainContactRelationship: 'guardian',
      })
    ).rejects.toMatchObject({
      path: 'guardianMobile',
      message: 'Enter a mobile number or email for the main school contact.',
    });
  });

  it.each([
    { guardianMobile: '9876543211', guardianEmail: '' },
    { guardianMobile: '', guardianEmail: 'aunt@example.com' },
  ])('accepts either saved contact method for a guardian main contact: %j', async (contact) => {
    await expect(
      admissionFamilyContactsSchema.validate({
        ...initialAdmissionFamilyContacts,
        addGuardian: true,
        guardianFullName: 'Pooja Shah',
        guardianRelationship: 'Aunt',
        mainContactRelationship: 'guardian',
        ...contact,
      })
    ).resolves.toBeDefined();
  });

  it('omits disabled optional adults and ignores their retained invalid fields', async () => {
    const draft = {
      ...initialAdmissionFamilyContacts,
      otherParentEmail: 'invalid',
      guardianEmail: 'invalid',
      mainContactRelationship: 'guardian' as const,
    };
    await expect(admissionFamilyContactsSchema.validate(draft)).resolves.toBeDefined();
    expect(buildAdmissionFamilyContacts(draft, 'mother')).toEqual({
      mainContactRelationship: 'mother',
    });
  });

  it('requires names and validates only supplied optional contact methods once enabled', async () => {
    await expect(
      admissionFamilyContactsSchema.validate({
        ...initialAdmissionFamilyContacts,
        addOtherParent: true,
      })
    ).rejects.toThrow('Other parent full name is required.');
    await expect(
      admissionFamilyContactsSchema.validate({
        ...initialAdmissionFamilyContacts,
        addGuardian: true,
        guardianFullName: 'Aunt',
        guardianRelationship: 'Aunt',
        guardianMobile: '123',
      })
    ).rejects.toThrow('Enter a valid 10-digit mobile number.');
    await expect(
      admissionFamilyContactsSchema.validate({
        ...initialAdmissionFamilyContacts,
        addGuardian: true,
        guardianFullName: 'Pooja',
        guardianRelationship: 'Aunt',
      })
    ).resolves.toBeDefined();
  });

  it('captures the other parent with the opposite relationship and normalizes email', () => {
    expect(
      buildAdmissionFamilyContacts(
        {
          ...initialAdmissionFamilyContacts,
          addOtherParent: true,
          otherParentFullName: '  Raj Shah ',
          otherParentEmail: ' RAJ@Example.COM ',
          mainContactRelationship: 'father',
        },
        'mother'
      )
    ).toEqual({
      otherParent: { relationship: 'father', fullName: 'Raj Shah', email: 'raj@example.com' },
      mainContactRelationship: 'father',
    });
  });

  it('resets a removed guardian main contact to the primary parent', () => {
    expect(
      buildAdmissionFamilyContacts(
        { ...initialAdmissionFamilyContacts, mainContactRelationship: 'guardian' },
        'father'
      )
    ).toEqual({ mainContactRelationship: 'father' });
  });
});
