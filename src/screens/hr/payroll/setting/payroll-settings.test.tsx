import { vi, it, expect, beforeEach } from 'vitest';
import { hrPermissions } from 'src/constants/hr-menus';
import { render, screen } from '@testing-library/react';

import PayrollSettings from './payroll-settings';

const auth = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  loading: false,
  permissionsInitialized: true,
}));
vi.mock('react-redux', () => ({ useSelector: () => auth }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: () => <h1>Payroll Settings</h1>,
}));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: any) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));
vi.mock('src/routes/components', () => ({ RouterLink: 'a' }));

beforeEach(() => {
  auth.permissions = [];
  auth.loading = false;
  auth.permissionsInitialized = true;
});
it('shows only destinations permitted by the existing navigation contract', () => {
  auth.permissions = [
    { name: `${hrPermissions.payroll.settings.earningComponents}.View`, isGranted: true },
  ];
  render(<PayrollSettings />);
  expect(screen.getByRole('link', { name: 'Earning components' })).toHaveAttribute(
    'href',
    '/hr/payroll/setting/earning-component'
  );
  expect(screen.queryByRole('link', { name: 'Deduction components' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Statutory Settings' })).not.toBeInTheDocument();
});
it('keeps unresolved permissions in a loading state', () => {
  auth.permissionsInitialized = false;
  render(<PayrollSettings />);
  expect(screen.getByLabelText('Loading payroll settings')).toBeVisible();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
it('explains the empty access state without offering unavailable destinations', () => {
  render(<PayrollSettings />);
  expect(screen.getByText(/No payroll settings are available/)).toBeVisible();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
