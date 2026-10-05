import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import {
  payrollValidationSchema,
  workExperienceValidationSchema,
  reportingManagerValidationSchema,
  additionalDetailsValidationSchema,
  personalInformationValidationSchema,
  getPersonalInformationValidationSchema,
} from './employee-form-validation';

const validPayroll = {
  bankName: 'State Bank of India',
  branchName: 'Main Branch',
  accountHolderName: 'Test Staff',
  accountNumber: '1234567890',
  ifscCode: 'SBIN0001234',
  tdsPercentage: null,
  tdsAmount: null,
};

describe('staff payroll policy override validation', () => {
  it('does not require override fields when override is disabled', async () => {
    await expect(
      payrollValidationSchema.validate({
        ...validPayroll,
        policyOverrideEnabled: false,
        policyOverridePayrollPolicyId: '',
        policyOverrideAttendancePolicyId: '',
        policyOverrideLeavePolicyId: '',
        policyOverrideEffectiveFrom: '',
      })
    ).resolves.toBeTruthy();
  });

  it('requires policy ids and effective date when override is enabled', async () => {
    await expect(
      payrollValidationSchema.validate(
        {
          ...validPayroll,
          policyOverrideEnabled: true,
          policyOverridePayrollPolicyId: '',
          policyOverrideAttendancePolicyId: '',
          policyOverrideLeavePolicyId: '',
          policyOverrideEffectiveFrom: '',
        },
        { abortEarly: false }
      )
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        'Payroll policy is required',
        'Attendance policy is required',
        'Leave policy is required',
        'Effective from date is required',
      ]),
    });
  });
});

describe('staff form contract validation', () => {
  it('validates profile photo size without Node Buffer', async () => {
    await expect(
      personalInformationValidationSchema.validateAt('photo', {
        photo: `data:image/png;base64,${'a'.repeat(1024)}`,
      })
    ).resolves.toBeTruthy();

    await expect(
      personalInformationValidationSchema.validateAt('photo', {
        photo: `data:image/png;base64,${'a'.repeat(4 * 1024 * 1024 + 8)}`,
      })
    ).rejects.toThrow('Photo size must be less than 3MB');
  });

  it('still requires a profile photo for new staff', async () => {
    await expect(
      getPersonalInformationValidationSchema({ requirePhoto: true }).validateAt('photo', {
        photo: '',
      })
    ).rejects.toThrow('Profile Photo is required');
  });

  it('allows missing profile photo when editing existing staff', async () => {
    await expect(
      getPersonalInformationValidationSchema({ requirePhoto: false }).validateAt('photo', {
        photo: '',
      })
    ).resolves.toBe('');
  });

  it('still validates profile photo size when editing existing staff', async () => {
    await expect(
      getPersonalInformationValidationSchema({ requirePhoto: false }).validateAt('photo', {
        photo: `data:image/png;base64,${'a'.repeat(4 * 1024 * 1024 + 8)}`,
      })
    ).rejects.toThrow('Photo size must be less than 3MB');
  });

  it('compares primary and secondary mobile after normalization', async () => {
    await expect(
      personalInformationValidationSchema.validateAt('secondaryMobileNo', {
        mobileNo: '9876543210',
        secondaryMobileNo: '+91 9876543210',
      })
    ).rejects.toThrow('Secondary Contact No. cannot be same as primary contact no.');
  });

  it('allows date of joining up to one year in the future', async () => {
    await expect(
      personalInformationValidationSchema.validateAt('dateOfJoining', {
        dateOfJoining: dayjs().add(1, 'year').subtract(1, 'day'),
      })
    ).resolves.toBeTruthy();

    await expect(
      personalInformationValidationSchema.validateAt('dateOfJoining', {
        dateOfJoining: dayjs().add(1, 'year').add(1, 'day'),
      })
    ).rejects.toThrow('Date of Joining cannot be more than 1 year in the future');
  });

  it('keeps pincode as a string so leading zeroes remain valid', async () => {
    await expect(
      personalInformationValidationSchema.validateAt('pincode', {
        pincode: '012345',
      })
    ).resolves.toBeTruthy();
  });

  it('shows the BPL card number length failure as a field validation error', async () => {
    await expect(
      additionalDetailsValidationSchema.validateAt('bplCardNo', {
        bplCardNo: '1'.repeat(51),
      })
    ).rejects.toThrow('BPL Card No cannot exceed 50 characters');
  });

  it('requires and validates PAN and Aadhaar numbers', async () => {
    await expect(
      personalInformationValidationSchema.validateAt('panNo', {
        panNo: '',
      })
    ).rejects.toThrow('PAN number is required');

    await expect(
      personalInformationValidationSchema.validateAt('panNo', {
        panNo: 'ABCDE1234F',
      })
    ).resolves.toBeTruthy();

    await expect(
      personalInformationValidationSchema.validateAt('adharNo', {
        adharNo: '',
      })
    ).rejects.toThrow('Aadhaar number is required');

    await expect(
      personalInformationValidationSchema.validateAt('adharNo', {
        adharNo: '900123456789',
      })
    ).resolves.toBeTruthy();
  });

  it('allows blank PAN and Aadhaar numbers when editing existing staff', async () => {
    const editSchema = getPersonalInformationValidationSchema({
      requirePhoto: false,
      requireIdentity: false,
    });

    await expect(editSchema.validateAt('panNo', { panNo: '' })).resolves.toBe('');
    await expect(editSchema.validateAt('adharNo', { adharNo: '' })).resolves.toBe('');
  });

  it('rejects invalid nonblank PAN and Aadhaar numbers when editing existing staff', async () => {
    const editSchema = getPersonalInformationValidationSchema({
      requirePhoto: false,
      requireIdentity: false,
    });

    await expect(editSchema.validateAt('panNo', { panNo: 'BADPAN' })).rejects.toThrow(
      'PAN must be in format: AAAAA9999A (5 letters, 4 digits, 1 letter)'
    );
    await expect(editSchema.validateAt('adharNo', { adharNo: '123' })).rejects.toThrow(
      'Aadhaar number must be exactly 12 digits and cannot start with 0 or 1'
    );
  });

  it('allows ongoing work experience without an end date', async () => {
    await expect(
      workExperienceValidationSchema.validateAt('experiences[0].endDate', {
        experiences: [{ startDate: dayjs('2024-01-01'), endDate: null }],
      })
    ).resolves.toBeNull();
  });

  it('uses payroll contract ranges for account number and TDS percentage', async () => {
    await expect(
      payrollValidationSchema.validate({
        ...validPayroll,
        accountNumber: '12345678',
      })
    ).rejects.toThrow('Account number must be at least 9 characters');

    await expect(
      payrollValidationSchema.validate({
        ...validPayroll,
        tdsPercentage: 0,
      })
    ).resolves.toBeTruthy();
  });

  it('requires reporting manager in staff creation flow', async () => {
    await expect(
      reportingManagerValidationSchema.validateAt('reportingManager', {
        reportingManager: '',
      })
    ).rejects.toThrow('Reporting manager is required');
  });

  it('requires reporting manager in staff edit flow because managers can only be swapped', async () => {
    await expect(
      reportingManagerValidationSchema.validateAt('reportingManager', {
        reportingManager: '',
      })
    ).rejects.toThrow('Reporting manager is required');
  });
});
