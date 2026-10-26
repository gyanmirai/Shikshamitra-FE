import { it, expect } from 'vitest';

import { payrollValidationSchema } from './employee-form-validation';
import { payrollProfilePatchSchema } from './payroll-profile-validation';

it.each(['SBIN0001234', 'ABCD0A12B34'])(
  'accepts the 11-character IFSC format %s in both payroll forms',
  async (ifscCode) => {
    await expect(payrollValidationSchema.validateAt('ifscCode', { ifscCode })).resolves.toBe(
      ifscCode
    );
    await expect(
      payrollProfilePatchSchema.validateAt('bankDetails.ifscCode', { bankDetails: { ifscCode } })
    ).resolves.toBe(ifscCode);
  }
);

it.each(['SBIN000123', 'SBIN00012345', '1BIN0001234', 'SBIN1001234', 'SBIN00012@4', 'sbin0001234'])(
  'rejects invalid IFSC %s in both payroll forms',
  async (ifscCode) => {
    await expect(payrollValidationSchema.validateAt('ifscCode', { ifscCode })).rejects.toThrow(
      /IFSC/
    );
    await expect(
      payrollProfilePatchSchema.validateAt('bankDetails.ifscCode', { bankDetails: { ifscCode } })
    ).rejects.toThrow(/IFSC/);
  }
);
