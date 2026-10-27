import userEvent from '@testing-library/user-event';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { render, screen, cleanup } from '@testing-library/react';
import { RecoveryContext } from 'src/screens/hr/recovery/hr-setup-controls';

import { SalaryTemplateSetupState } from './salary-template-setup-state';

const auth = vi.hoisted(() => ({
  permissions: [] as { name: string; isGranted: boolean }[],
  loading: false,
  permissionsInitialized: true,
}));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth }) }));
vi.mock('src/components/empty-content', () => ({
  EmptyContent: ({ title, description, action }: any) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  ),
}));

beforeEach(() => {
  auth.permissions = [
    hrPermissions.root,
    hrPermissions.payroll.root,
    hrPermissions.payroll.settings.root,
    hrPermissions.payroll.settings.salaryTemplateActions.view,
    hrPermissions.payroll.settings.salaryTemplateActions.add,
  ].map((name) => ({ name, isGranted: true }));
});
afterEach(cleanup);

it('opens the fixed create route safely and supports explicit refresh after returning', async () => {
  const user = userEvent.setup();
  const beginSetup = vi.fn();
  const refresh = vi.fn().mockResolvedValue({});
  render(
    <RecoveryContext.Provider value={{ beginSetup }}>
      <SalaryTemplateSetupState busy={false} refresh={refresh} />
    </RecoveryContext.Provider>
  );
  const link = screen.getByRole('link', { name: 'Create salary template (opens in a new tab)' });
  expect(link).toHaveAttribute('href', hrPaths.payroll.settings.salaryTemplateCreate);
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  // Native new-tab navigation is verified by attributes; keep happy-dom on the test page.
  link.addEventListener('click', (event) => event.preventDefault());
  await user.click(link);
  expect(beginSetup).toHaveBeenCalledOnce();
  await user.click(screen.getByRole('button', { name: 'Refresh setup' }));
  expect(refresh).toHaveBeenCalledOnce();
  expect(await screen.findByRole('status')).toHaveTextContent('Setup refreshed');
});

it.each([
  hrPermissions.payroll.settings.salaryTemplateActions.add,
  hrPermissions.payroll.settings.salaryTemplateActions.view,
  hrPermissions.payroll.settings.root,
])('requires the existing route and exact create permissions (%s)', (denied) => {
  auth.permissions = auth.permissions.filter(({ name }) => name !== denied);
  render(<SalaryTemplateSetupState busy={false} refresh={vi.fn()} />);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText(/Ask an authorized HR administrator/)).toBeVisible();
});

it.each([false, true])(
  'distinguishes failed reads and denied access from a successful empty list (%s)',
  (accessDenied) => {
    render(
      <SalaryTemplateSetupState failed accessDenied={accessDenied} busy={false} refresh={vi.fn()} />
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      accessDenied ? 'access unavailable' : 'could not be loaded'
    );
    expect(screen.queryByText('No active salary templates')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  }
);

it('reports refresh failure without replacing it with an empty success', async () => {
  const user = userEvent.setup();
  render(
    <SalaryTemplateSetupState
      failed
      busy={false}
      refresh={vi.fn().mockRejectedValue(new Error('offline'))}
    />
  );
  await user.click(screen.getByRole('button', { name: 'Refresh setup' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Your entries are still here');
  expect(screen.getByRole('button', { name: 'Refresh setup' })).toBeEnabled();
});
