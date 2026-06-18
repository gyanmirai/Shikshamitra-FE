import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { buildProfilePersonalInfoUpdatePayload } from './personal-info-update-payload';

describe('profile personal-info update payload', () => {
  it('omits PAN and Aadhaar fields when profile identity values are unchanged', () => {
    const payload = buildProfilePersonalInfoUpdatePayload({
      lastName: 'Patel',
      firstName: 'Akshay',
      middleName: 'Kumar',
      shortName: 'Akshay',
      dob: dayjs('1990-01-01'),
      familyCast: 'General',
      castType: 0,
      gender: 1,
      religion: 'Hindu',
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
    });

    expect(payload).not.toHaveProperty('panNo');
    expect(payload).not.toHaveProperty('adharNo');
    expect(payload.mobileNo).toBe('9876543210');
  });
});
