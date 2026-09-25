import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import SalaryProtectionMigration from './salary-protection-migration';

const mocks = vi.hoisted(() => ({ preview: vi.fn(), apply: vi.fn() }));
vi.mock('src/redux/hr/compensation-revision-api', () => ({
  usePreviewProtectionMigrationMutation: () => [mocks.preview, { isLoading: false }],
  useApplyProtectionMigrationMutation: () => [mocks.apply, { isLoading: false }],
}));
vi.mock('react-redux', () => ({ useSelector: () => ({ isChanges: false }), useDispatch: () => vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('sonner', () => ({ toast: { success: vi.fn() } }));
const migrated = { id: 'new-revision', protectionPolicy: 'PROTECT_EMPLOYER_COST' };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.preview.mockReturnValue({ unwrap: () => Promise.resolve({
    sourceRevisionId: 'old-revision', previousPolicy: 'PROTECT_GROSS',
    previousGross: 20000, previousNet: 19800, previousEmployerCost: 22000,
    preview: { previewToken: 'signed-review', calculation: {
      protectionPolicy: 'PROTECT_EMPLOYER_COST', grossSalary: 20000, netSalary: 19800,
      employerCost: 22000, protectedMonthlyAmount: 22000,
    } },
  }) });
  mocks.apply.mockReturnValue({ unwrap: () => Promise.resolve(migrated) });
});
function setup() {
  const onApplied = vi.fn();
  render(<ThemeProvider theme={createTheme(defaultSettings)}>
    <SalaryProtectionMigration employeeId="employee-1" source={{ id: 'old-revision' } as any}
      effectiveMonth="2026-10" onApplied={onApplied} />
  </ThemeProvider>);
  return { user: userEvent.setup(), onApplied };
}
it('previews without writing and applies the reviewed effective month and proof', async () => {
  const { user, onApplied } = setup();
  await user.click(screen.getByRole('button', { name: 'Review migration' }));
  await screen.findByText(/Protected monthly target/);
  expect(mocks.apply).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Apply migration' }));
  await waitFor(() => expect(onApplied).toHaveBeenCalledWith(migrated));
  expect(mocks.apply).toHaveBeenCalledWith({ employeeId: 'employee-1', sourceRevisionId: 'old-revision',
    effectiveMonth: '2026-10-01T00:00:00.000Z', previewToken: 'signed-review' });
});
it('shows a failed apply and keeps the salary unchanged', async () => {
  mocks.apply.mockReturnValue({ unwrap: () => Promise.reject(Object.assign(new Error('Conflict'), { data: { detail: 'The salary changed. Review again.' } })) });
  const { user, onApplied } = setup();
  await user.click(screen.getByRole('button', { name: 'Review migration' }));
  await screen.findByText(/Protected monthly target/);
  await user.click(screen.getByRole('button', { name: 'Apply migration' }));
  await screen.findByText('The salary changed. Review again.');
  expect(onApplied).not.toHaveBeenCalled();
});
