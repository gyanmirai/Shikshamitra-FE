export const getFamilyStatusStorageKey = (tenantId: string, token: string) =>
  `admission-family-status:${tenantId}:${token}`;
