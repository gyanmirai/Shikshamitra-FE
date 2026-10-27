import { it, vi, expect, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import PayslipSettingsForm from './payslip-settings-form';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./payslip-settings-preview', () => ({ default: () => <div>Sample preview</div> }));

const state = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('@mui/icons-material', () => ({ Close: () => null, DeleteOutline: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/redux/hr/payslip-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/redux/hr/payslip-api')>()),
  useUploadPayslipLogoMutation: () => [vi.fn(), { isLoading: false }],
  useGetPayslipSettingsQuery: () => ({
    data: {
      schoolName: 'Synthetic school',
      schoolAddress: 'Synthetic address',
      automaticEmail: false,
      concurrencyStamp: 'version-1',
      idempotencyKey: 'request-1',
    },
  }),
  useSavePayslipSettingsMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
const navigationDescriptor = Object.getOwnPropertyDescriptor(window, 'navigation');
afterEach(() => {
  cleanup();
  state.push.mockReset();
  if (navigationDescriptor) Object.defineProperty(window, 'navigation', navigationDescriptor);
  else Reflect.deleteProperty(window, 'navigation');
});

it('protects a dirty settings draft on internal links, including keep-editing and deliberate discard', async () => {
  render(
    <>
      <PayslipSettingsForm canEdit />
      <a href="/hr/payroll/run-payroll">Run payroll</a>
    </>
  );
  await act(async () => {
    fireEvent.click(
      screen.getByRole('switch', { name: 'Email each employee after payroll finalization' })
    );
  });
  fireEvent.click(screen.getByRole('link', { name: 'Run payroll' }));
  expect(state.push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(
    screen.getByRole('switch', { name: 'Email each employee after payroll finalization' })
  ).toBeChecked();
  fireEvent.click(screen.getByRole('link', { name: 'Run payroll' }));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  });
  expect(state.push).toHaveBeenCalledExactlyOnceWith('/hr/payroll/run-payroll');
});

it('protects browser traversal and only resumes it after discard', async () => {
  const navigation = Object.assign(new EventTarget(), {
    traverseTo: vi.fn(() => ({ finished: Promise.resolve() })),
  });
  Object.defineProperty(window, 'navigation', { configurable: true, value: navigation });
  render(<PayslipSettingsForm canEdit />);
  await act(async () => {
    fireEvent.click(
      screen.getByRole('switch', { name: 'Email each employee after payroll finalization' })
    );
  });
  const traverse = () => {
    const event = Object.assign(new Event('navigate', { cancelable: true }), {
      navigationType: 'traverse',
      destination: {
        key: 'previous-payroll-page',
        url: `${window.location.origin}/hr/payroll/run-payroll`,
      },
    });
    act(() => {
      navigation.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
  };
  traverse();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(navigation.traverseTo).not.toHaveBeenCalled();
  traverse();
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  });
  expect(navigation.traverseTo).toHaveBeenCalledExactlyOnceWith('previous-payroll-page');
});
