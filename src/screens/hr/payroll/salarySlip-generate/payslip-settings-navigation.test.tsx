import { it, vi, expect, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import PayslipSettingsForm from './payslip-settings-form';

const state = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: state.push }) }));
vi.mock('@mui/icons-material', () => ({ Close: () => null, DeleteOutline: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/redux/hr/payslip-api', () => ({
  useGetPayslipSettingsQuery: () => ({ data: { schoolName: 'Synthetic school', schoolAddress: 'Synthetic address',
    automaticEmail: false, concurrencyStamp: 'version-1', idempotencyKey: 'request-1' } }),
  useSavePayslipSettingsMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
const navigationDescriptor = Object.getOwnPropertyDescriptor(window, 'navigation');
afterEach(() => {
  cleanup(); state.push.mockReset();
  if (navigationDescriptor) Object.defineProperty(window, 'navigation', navigationDescriptor);
  else Reflect.deleteProperty(window, 'navigation');
});

it('protects a dirty settings draft on internal links, including keep-editing and deliberate discard', () => {
  render(<><PayslipSettingsForm canEdit /><a href="/hr/payroll/run-payroll">Run payroll</a></>);
  fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'Unsaved school' } });
  fireEvent.click(screen.getByRole('link', { name: 'Run payroll' }));
  expect(state.push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByLabelText('School name')).toHaveValue('Unsaved school');
  fireEvent.click(screen.getByRole('link', { name: 'Run payroll' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(state.push).toHaveBeenCalledExactlyOnceWith('/hr/payroll/run-payroll');
});

it('protects browser traversal and only resumes it after discard', () => {
  const navigation = Object.assign(new EventTarget(), { traverseTo: vi.fn(() => ({ finished: Promise.resolve() })) });
  Object.defineProperty(window, 'navigation', { configurable: true, value: navigation });
  render(<PayslipSettingsForm canEdit />);
  fireEvent.change(screen.getByLabelText('School name'), { target: { value: 'Unsaved school' } });
  const traverse = () => {
    const event = Object.assign(new Event('navigate', { cancelable: true }), { navigationType: 'traverse',
      destination: { key: 'previous-payroll-page', url: `${window.location.origin}/hr/payroll/run-payroll` } });
    act(() => { navigation.dispatchEvent(event); });
    expect(event.defaultPrevented).toBe(true);
  };
  traverse();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(navigation.traverseTo).not.toHaveBeenCalled();
  traverse();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(navigation.traverseTo).toHaveBeenCalledExactlyOnceWith('previous-payroll-page');
});
