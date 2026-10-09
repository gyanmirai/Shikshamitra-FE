export type TenantPasswordPolicy = {
  requiredLength: number;
  requiredUniqueChars: number;
  requireNonAlphanumeric: boolean;
  requireLowercase: boolean;
  requireUppercase: boolean;
  requireDigit: boolean;
};

export function readTenantPasswordPolicy(response: {
  setting?: { values?: Record<string, string> };
}): TenantPasswordPolicy {
  const values = response.setting?.values;
  const read = (name: string) => values?.[`Abp.Identity.Password.${name}`];
  const integer = (name: string) => {
    const value = read(name);
    if (!value || !/^\d+$/.test(value)) throw new Error('Password settings are unavailable');
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed)) throw new Error('Password settings are unavailable');
    return parsed;
  };
  const boolean = (name: string) => {
    const value = read(name)?.toLowerCase();
    if (value !== 'true' && value !== 'false') throw new Error('Password settings are unavailable');
    return value === 'true';
  };
  return {
    requiredLength: Math.max(8, integer('RequiredLength')),
    requiredUniqueChars: integer('RequiredUniqueChars'),
    requireNonAlphanumeric: boolean('RequireNonAlphanumeric'),
    requireLowercase: boolean('RequireLowercase'),
    requireUppercase: boolean('RequireUppercase'),
    requireDigit: boolean('RequireDigit'),
  };
}
