import { useSyncExternalStore } from 'react';

export const tenants = {
  ddvs: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  swaminarayan: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
};
type TenantKey = keyof typeof tenants;
let tenant: TenantKey = (sessionStorage.getItem('shift-test-tenant') as TenantKey) || 'ddvs';
const listeners = new Set<() => void>();
const session = () => ({
  accessToken: tenants[tenant],
  profile: { sub: 'same-synthetic-user', tenantid: tenants[tenant], role: 'admin' },
});
let current = session();
export function switchTenant(next: TenantKey) {
  tenant = next;
  sessionStorage.setItem('shift-test-tenant', next);
  current = session();
  listeners.forEach((listener) => listener());
}
export async function getSession() {
  return current;
}
export async function signOut() {
  switchTenant('ddvs');
}
export function useSession() {
  const data = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current
  );
  return { data, status: 'authenticated' };
}
