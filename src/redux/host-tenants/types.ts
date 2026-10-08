export interface HostSessionContext {
  accountMode: 'host' | 'tenant';
  tenantId: string | null;
  canViewTenants: boolean;
  canCreateTenants: boolean;
  canUpdateTenants: boolean;
  canManageTenantStatus: boolean;
}

export interface TenantDetails {
  instituteName: string;
  email: string;
  contactNumber: string;
  address1: string;
  address2?: string | null;
  address3?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}
export interface HostTenant extends TenantDetails {
  id: string;
  name: string;
  isActive: boolean;
  concurrencyStamp: string;
  creationTime: string;
}
export interface CreateTenantInput extends TenantDetails {
  name: string;
  adminEmailAddress: string;
  adminPassword: string;
}
export interface UpdateTenantInput extends TenantDetails {
  concurrencyStamp: string;
}
export interface TenantListQuery {
  filter?: string;
  isActive?: boolean;
  sorting?: string;
  skipCount: number;
  maxResultCount: number;
}
export interface TenantPage {
  totalCount: number;
  items: HostTenant[];
}
