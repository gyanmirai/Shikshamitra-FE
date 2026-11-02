import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SchoolNavigationBrand } from './school-navigation-brand';

const context = vi.hoisted(() => ({
  auth: { sessionContext: { accountMode: 'tenant', tenantId: 'tenant-a' } },
  tenant: { currentData: { name: 'DDVS', extraProperties: { InstituteName: 'Long school name' } } },
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: typeof context) => unknown) => select(context),
}));
vi.mock('src/redux/tenant/tenantApi', () => ({ useGetTenantByIdQuery: () => context.tenant }));
vi.mock('src/routes/components', () => ({ RouterLink: 'a' }));
vi.mock('src/components/logo', () => ({ LogoWithText: () => <span>GyanMirai</span> }));
vi.mock('./school-branding-logo', () => ({
  SchoolBrandingLogo: ({ tenantId }: { tenantId?: string }) => (
    <span data-testid="school-logo">{tenantId}</span>
  ),
}));

it('uses school code and tenant logo in the expanded sidebar and logo only when collapsed', () => {
  const view = render(<SchoolNavigationBrand href="/dashboard" />);
  expect(screen.getByText('DDVS')).toBeVisible();
  expect(screen.queryByText('GyanMirai')).not.toBeInTheDocument();
  expect(screen.getByTestId('school-logo')).toHaveTextContent('tenant-a');
  expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard');
  view.rerender(<SchoolNavigationBrand href="/dashboard" compact />);
  expect(screen.queryByText('DDVS')).not.toBeInTheDocument();
  expect(screen.getByTestId('school-logo')).toBeVisible();
  context.auth.sessionContext.accountMode = 'host';
  view.rerender(<SchoolNavigationBrand href="/host/tenants" />);
  expect(screen.getByText('GyanMirai')).toBeVisible();
});
