export const hostTenantPath = '/host/tenants';
export const hostTenantPermissions = {
  view: 'AbpTenantManagement.Tenants',
  create: 'AbpTenantManagement.Tenants.Create',
  update: 'AbpTenantManagement.Tenants.Update',
  manageStatus: 'AbpTenantManagement.Tenants.ManageStatus',
} as const;
