import { it, expect, describe } from 'vitest';

import { tenantError, tenantSchema, tenantDetails, tenantFormValues } from './tenant-form';

const values = {
  ...tenantFormValues(),
  name: 'SUNRISE',
  instituteName: ' Sunrise School ',
  email: 'office@example.test',
  contactNumber: '9876543210',
  address1: 'School Road',
  city: 'Surat',
  state: 'Gujarat',
  country: 'India',
  postalCode: '395001',
  adminEmailAddress: 'admin@example.test',
  adminPassword: 'Synthetic-Secret-29!',
};

describe('tenant form contract', () => {
  it('sends only editable details when updating a tenant', () => {
    const details = tenantDetails(values);
    expect(details.instituteName).toBe('Sunrise School');
    expect(details).not.toHaveProperty('name');
    expect(details).not.toHaveProperty('adminPassword');
    expect(details).not.toHaveProperty('isActive');
    expect(details).not.toHaveProperty('adminEmailAddress');
  });
  it('requires initial credentials only during creation and validates the school code', async () => {
    await expect(tenantSchema(true).validate(values)).resolves.toBeDefined();
    await expect(tenantSchema(true).validate({ ...values, name: 'school code' })).rejects.toThrow();
    await expect(tenantSchema(true).validate({ ...values, adminPassword: '' })).rejects.toThrow();
    await expect(
      tenantSchema(false).validate({ ...values, adminPassword: '', adminEmailAddress: '' })
    ).resolves.toBeDefined();
  });
  it('keeps optional address lines empty and explains concurrency failures', () => {
    expect(tenantFormValues().address2).toBe('');
    expect(tenantError({ status: 409 })).toContain('Reload the latest details');
  });
});
