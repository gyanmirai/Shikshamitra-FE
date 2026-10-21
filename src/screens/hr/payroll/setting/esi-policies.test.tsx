import { vi, it, expect, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import EsiPolicies from './esi-policies';

const mocks = vi.hoisted(() => ({ create: vi.fn(), canWrite: true }));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: [] }, confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/utils/permissions', () => ({ hasGrantedPermission: () => mocks.canWrite }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customizabaleTable', () => ({
  default: () => <div>Policy catalogue</div>,
}));
vi.mock('src/redux/hr/esi-policy-api', () => ({
  useGetEsiPoliciesQuery: () => ({ data: [], isLoading: false }),
  useCreateEsiPolicyMutation: () => [mocks.create, { isLoading: false }],
  useAddEsiPolicyVersionMutation: () => [vi.fn(), { isLoading: false }],
  useArchiveEsiPolicyMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/hr/statutory-scheme-api', () => ({
  useGetEsiComponentTreatmentsQuery: () => ({ data: [] }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mocks.canWrite = true;
});
const show = () =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <EsiPolicies hasSchoolWideScope />
    </ThemeProvider>
  );

it('submits one actual form and retains the idempotency key after an error', async () => {
  mocks.create.mockReturnValue({ unwrap: () => Promise.reject(new Error('Network unavailable')) });
  const user = userEvent.setup();
  show();
  await user.click(screen.getByRole('button', { name: 'Create policy' }));
  const dialog = screen.getByRole('dialog');
  expect(dialog.querySelectorAll('form')).toHaveLength(1);
  fireEvent.change(within(dialog).getByLabelText('Policy name', { exact: false }), {
    target: { value: 'School ESIC' },
  });
  fireEvent.change(within(dialog).getByLabelText('Policy code', { exact: false }), {
    target: { value: 'SCHOOL_ESIC' },
  });
  fireEvent.change(within(dialog).getByLabelText('Source URL', { exact: false }), {
    target: { value: 'https://example.com/esic' },
  });
  await user.click(within(dialog).getByRole('button', { name: 'Create policy' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
  const body = mocks.create.mock.calls[0][0];
  expect(body).toMatchObject({
    name: 'School ESIC',
    code: 'SCHOOL_ESIC',
    employeePercentage: 0.75,
    employerPercentage: 3.25,
  });
  expect(body.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  await user.click(within(dialog).getByRole('button', { name: 'Create policy' }));
  await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(2));
  expect(mocks.create.mock.calls[1][0].idempotencyKey).toBe(body.idempotencyKey);
});

it('does not expose policy creation without the exact write grants', () => {
  mocks.canWrite = false;
  show();
  expect(screen.queryByRole('button', { name: 'Create policy' })).not.toBeInTheDocument();
});
