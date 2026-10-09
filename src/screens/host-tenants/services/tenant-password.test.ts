import { it, expect, describe } from 'vitest';
import { readTenantPasswordPolicy } from 'src/redux/host-tenants/password-policy';

import { tenantPasswordHelp, tenantPasswordSchema } from './tenant-password';

const settings = {
  'Abp.Identity.Password.RequiredLength': '6',
  'Abp.Identity.Password.RequiredUniqueChars': '1',
  'Abp.Identity.Password.RequireNonAlphanumeric': 'True',
  'Abp.Identity.Password.RequireLowercase': 'True',
  'Abp.Identity.Password.RequireUppercase': 'True',
  'Abp.Identity.Password.RequireDigit': 'True',
};
const policy = readTenantPasswordPolicy({ setting: { values: settings } });

describe('initial tenant password policy', () => {
  it('combines server policy with the tenant endpoint minimum of eight', async () => {
    expect(policy.requiredLength).toBe(8);
    await expect(tenantPasswordSchema(policy).validate('Ab1!xyz')).rejects.toThrow('8 characters');
    await expect(tenantPasswordSchema(policy).validate('Ab1!xyzw')).resolves.toBe('Ab1!xyzw');
    expect(tenantPasswordHelp(policy)).toContain('a special character');
  });
  it.each([
    ['12345678', 'lowercase'],
    ['abcdefgh', 'uppercase'],
    ['Abcdefgh', 'digit'],
    ['Abcdefg1', 'special character'],
  ])('rejects %s with an actionable character requirement', async (password, message) => {
    await expect(tenantPasswordSchema(policy).validate(password)).rejects.toThrow(message);
  });
  it('respects disabled character rules and stricter configured length and uniqueness', async () => {
    const relaxed = {
      ...policy,
      requireLowercase: false,
      requireUppercase: false,
      requireDigit: false,
      requireNonAlphanumeric: false,
    };
    await expect(tenantPasswordSchema(relaxed).validate('12345678')).resolves.toBeDefined();
    await expect(
      tenantPasswordSchema({ ...relaxed, requiredLength: 12 }).validate('12345678')
    ).rejects.toThrow('12 characters');
    await expect(
      tenantPasswordSchema({ ...relaxed, requiredUniqueChars: 4 }).validate('12121212')
    ).rejects.toThrow('4 different characters');
  });
  it('rejects missing and malformed server configuration instead of guessing its policy', () => {
    expect(() => readTenantPasswordPolicy({})).toThrow('settings are unavailable');
    expect(() =>
      readTenantPasswordPolicy({
        setting: {
          values: {
            ...settings,
            'Abp.Identity.Password.RequireDigit': 'invalid',
          },
        },
      })
    ).toThrow('settings are unavailable');
    expect(() =>
      readTenantPasswordPolicy({
        setting: {
          values: {
            ...settings,
            'Abp.Identity.Password.RequiredLength': '8x',
          },
        },
      })
    ).toThrow('settings are unavailable');
  });
});
