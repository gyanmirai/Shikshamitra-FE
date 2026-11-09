import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';
import { ReligionType } from 'src/enums/religion';

import { personalInformationInitialValues } from './personal-info-initial-values';
import { buildProfilePersonalInfoUpdatePayload } from './personal-info-update-payload';

describe('profile personal-info update payload', () => {
  const buildValues = (overrides: Record<string, any> = {}) => ({
    lastName: 'Patel',
    firstName: 'Akshay',
    middleName: 'Kumar',
    shortName: 'Akshay',
    dob: dayjs('1990-01-01'),
    familyCast: 'General',
    castType: 0,
    gender: 1,
    religion: ReligionType.Hinduism,
    maritalStatus: 0,
    bloodGroup: null,
    mobileNo: '+91 98765 43210',
    secondaryMobileNo: '',
    email: 'akshay.patel@example.test',
    department: 'Academics',
    dateOfJoining: dayjs('2024-06-01'),
    employeeGroup: 0,
    role: 'role-1',
    addressLine1: 'House 1',
    addressLine2: 'Main Road',
    addressLine3: '',
    country: { name: 'India', isoCode: 'IN' },
    state: { name: 'Gujarat', isoCode: 'GJ' },
    city: { name: 'Ahmedabad' },
    pincode: '380001',
    shift: 'shift-1',
    ...overrides,
  });

  it('round-trips supplementary fields initialized from the saved profile on an unrelated edit', () => {
    const savedProfile = {
      dob: '1990-01-01',
      doj: '2024-06-01',
      designation: 'Senior Teacher',
      qualification: 'M.Ed.',
      identificationMark1: 'Mole on left cheek',
    };
    const values = buildValues({
      ...personalInformationInitialValues(savedProfile),
      lastName: 'Shah',
    });

    const payload = buildProfilePersonalInfoUpdatePayload(values);

    expect(payload.designation).toBe(savedProfile.designation);
    expect(payload.qualification).toBe(savedProfile.qualification);
    expect(payload.identificationMark1).toBe(savedProfile.identificationMark1);
    expect(payload.lastName).toBe('Shah');
  });

  it.each([null, ''])('preserves intentional clearing with %s', (cleared) => {
    const values = buildValues({
      designation: cleared,
      qualification: cleared,
      identificationMark1: cleared,
    });

    const payload = buildProfilePersonalInfoUpdatePayload(values);

    expect(payload.designation).toBe(cleared);
    expect(payload.qualification).toBe(cleared);
    expect(payload.identificationMark1).toBe(cleared);
  });

  it('does not send clears for fields missing from an older or partial profile response', () => {
    const values = buildValues(
      personalInformationInitialValues({
        dob: '1990-01-01',
        doj: '2024-06-01',
        designation: 'Teacher',
      })
    );
    const payload = JSON.parse(JSON.stringify(buildProfilePersonalInfoUpdatePayload(values)));

    expect(payload.designation).toBe('Teacher');
    expect(payload).not.toHaveProperty('qualification');
    expect(payload).not.toHaveProperty('identificationMark1');
  });

  it('resets previous supplementary form values when the next profile omits them', () => {
    const fields = {
      designation: 'Previous teacher',
      qualification: 'Previous qualification',
      identificationMark1: 'Previous mark',
      ...personalInformationInitialValues(),
    };

    expect(fields.designation).toBeUndefined();
    expect(fields.qualification).toBeUndefined();
    expect(fields.identificationMark1).toBeUndefined();
  });

  it('omits PAN and Aadhaar fields when profile identity values are unchanged', () => {
    const payload = buildProfilePersonalInfoUpdatePayload(
      buildValues({ panNo: 'ABCDE1234F', adharNo: '811122223333' }),
      { initialValues: { panNo: 'ABCDE1234F', adharNo: '811122223333' } }
    );

    expect(payload).not.toHaveProperty('panNo');
    expect(payload).not.toHaveProperty('adharNo');
    expect(payload.mobileNo).toBe('9876543210');
    expect(payload.religion).toBe('Hinduism');
  });

  it('includes normalized PAN and Aadhaar fields when identity values are changed', () => {
    const payload = buildProfilePersonalInfoUpdatePayload(
      buildValues({ panNo: 'abcde9999f', adharNo: '899988887777' }),
      { initialValues: { panNo: 'ABCDE1234F', adharNo: '811122223333' } }
    );

    expect(payload.panNo).toBe('ABCDE9999F');
    expect(payload.adharNo).toBe('899988887777');
  });

  it('uses information-tab initial identity fields when deciding changed PAN and Aadhaar', () => {
    const payload = buildProfilePersonalInfoUpdatePayload(
      buildValues({ panNo: 'abcde9999f', adharNo: '899988887777' }),
      { initialValues: { initialPanNo: 'ABCDE1234F', initialAdharNo: '811122223333' } }
    );

    expect(payload.panNo).toBe('ABCDE9999F');
    expect(payload.adharNo).toBe('899988887777');
  });

  it('omits unchanged identity fields from information-tab values shape', () => {
    const payload = buildProfilePersonalInfoUpdatePayload(
      buildValues({
        panNo: 'ABCDE1234F',
        adharNo: '811122223333',
        initialPanNo: 'ABCDE1234F',
        initialAdharNo: '811122223333',
      })
    );

    expect(payload).not.toHaveProperty('panNo');
    expect(payload).not.toHaveProperty('adharNo');
  });
});
