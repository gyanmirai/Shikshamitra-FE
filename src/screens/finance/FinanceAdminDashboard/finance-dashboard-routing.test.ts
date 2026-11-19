import { it, expect } from 'vitest';

import { resolveFinanceDashboardView } from './finance-dashboard-routing';

it('shows the administrator dashboard for admins with multiple session roles', () => {
  expect(resolveFinanceDashboardView({ profile: { role: ['Finance Officer', 'admin'] } })).toBe(
    'admin'
  );
  expect(resolveFinanceDashboardView({ profile: { roles: ['IT Administrator'] } })).toBe('admin');
});

it('preserves the principal and accountant dashboard choices', () => {
  expect(resolveFinanceDashboardView({ profile: { role: 'Vice Principal' } })).toBe('principal');
  expect(resolveFinanceDashboardView({ profile: { role: ['Clerk'] } })).toBe('accountant');
  expect(resolveFinanceDashboardView({ profile: { role: ['Teacher'] } })).toBeNull();
});
