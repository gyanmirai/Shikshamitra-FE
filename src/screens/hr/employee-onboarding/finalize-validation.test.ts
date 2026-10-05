import dayjs from 'dayjs';
import { vi, it, expect, describe } from 'vitest';

import {
  finalizeEmployeeFieldsSchema,
  validateFinalizeEmployeeValues,
  applyFinalizeEmployeeValidation,
} from './finalize-validation';

import type { FinalizeFormState } from './finalize-validation';

const validValues = (): FinalizeFormState => ({
  firstName: 'Riya',
  middleName: '',
  lastName: 'Shah',
  dob: dayjs('1990-01-01'),
  gender: '2',
  religion: 0,
  casteType: '0',
  familyCaste: 'General',
  maritalStatus: '0',
  bloodGroup: '',
  email: 'riya@example.com',
  mobileNo: '9876543210',
  secondaryMobileNo: '8876543210',
  panNo: 'ABCDE1234F',
  adharNo: '123456789012',
  doj: '2026-07-26',
  isTeaching: false,
  department: 'Administration',
  designation: 'Coordinator',
  qualification: '',
  identificationMark1: '',
  roleId: 'employee-role',
  shiftId: 'day-shift',
  academicPermissionStageIds: '',
  address1: 'House 1',
  address2: 'School Road',
  address3: '',
  countryName: 'India',
  countryIsoCode: 'IN',
  stateName: 'Gujarat',
  stateIsoCode: 'GJ',
  city: 'Ahmedabad',
  pinCode: '380001',
  useSubmittedPhoto: true,
  attachResumeAsDocument: true,
});

describe('staff application finalization validation', () => {
  it('accepts a complete staff record', () => {
    expect(finalizeEmployeeFieldsSchema.isValidSync(validValues(), { abortEarly: false })).toBe(
      true
    );
  });

  it.each([
    ['casteType', ''],
    ['familyCaste', ' '],
    ['panNo', 'abc'],
    ['mobileNo', '123'],
  ] as const)('blocks finalization when %s is invalid', async (field, value) => {
    const values = validValues();
    values[field] = value as never;

    const errors = await validateFinalizeEmployeeValues(values);

    expect(errors[field]).toBeTruthy();
    expect(finalizeEmployeeFieldsSchema.isValidSync(values, { abortEarly: false })).toBe(false);
  });

  it('keeps explicit errors after marking every staff field touched', async () => {
    const values = validValues();
    values.familyCaste = '';
    let renderedErrors = {};
    const setTouched = vi.fn(async () => undefined);
    const setErrors = vi.fn((errors) => {
      renderedErrors = errors;
    });

    await applyFinalizeEmployeeValidation({
      values,
      setTouched,
      setErrors,
    });

    expect(setTouched).toHaveBeenCalledWith(
      expect.objectContaining({ familyCaste: true, casteType: true }),
      false
    );
    expect(setErrors).toHaveBeenCalledWith(
      expect.objectContaining({ familyCaste: 'Family Caste is required' })
    );
    expect(renderedErrors).toMatchObject({ familyCaste: 'Family Caste is required' });
  });
});
