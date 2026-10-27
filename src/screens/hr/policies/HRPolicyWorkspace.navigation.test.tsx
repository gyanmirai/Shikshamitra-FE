import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { hrPermissions } from 'src/constants/hr-menus';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { extendTheme, ThemeProvider } from '@mui/material/styles';
import { ProgressBar } from 'src/components/progress-bar/progress-bar';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import confirmPopup, { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import HRPolicyWorkspace from './HRPolicyWorkspace';

const mocks = vi.hoisted(() => ({ ctx: {} as any, push: vi.fn(), back: vi.fn() }));
vi.mock('./hooks/useHRPolicyWorkspace', () => ({ useHRPolicyWorkspace: () => mocks.ctx }));
vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push: mocks.push, back: mocks.back }),
  usePathname: () => '/hr/calendars',
  useSearchParams: () => null,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('./components/HRPolicySharedUI', () => ({ PolicyOperationOverlay: () => null }));
vi.mock('./components/PolicyTable', () => ({ PolicyTable: () => null }));
vi.mock('./components/CalendarsTab', () => ({ CalendarsTab: () => null }));
vi.mock('./components/AssignmentsTab', () => ({ AssignmentsTab: () => null }));
vi.mock('./components/PolicyAuditDrawer', () => ({ PolicyAuditDrawer: () => null }));
vi.mock('./components/PolicyImpactDrawer', () => ({ PolicyImpactDrawer: () => null }));
vi.mock('./components/LeavePoliciesPanel', () => ({ LeavePoliciesPanel: () => null }));
vi.mock('./components/PolicyVersionDrawer', () => ({ PolicyVersionDrawer: () => null }));
vi.mock('./components/ManualHolidayDialog', () => ({ ManualHolidayDialog: () => null }));
vi.mock('./components/PayrollPolicyDrawer', () => ({ PayrollPolicyDrawer: () => null }));
vi.mock('./components/CalendarPolicyDrawer', () => ({
  CalendarPolicyDrawer: ({ ctx }: any) => (
    <>
      <button type="button" onClick={ctx.closeDrawer}>
        Header close
      </button>
      <button type="button" onClick={ctx.closeDrawer}>
        Footer cancel
      </button>
    </>
  ),
}));
vi.mock('./components/AttendancePolicyDrawer', () => ({ AttendancePolicyDrawer: () => null }));
vi.mock('./components/AssignmentPolicyDrawer', () => ({ AssignmentPolicyDrawer: () => null }));

const theme = extendTheme({ customShadows: { z1: 'none' } } as any);

function setup(kind: string, mode = 'edit') {
  const store = configureStore({
    reducer: {
      confirmPopup,
      auth: () => ({
        permissions: Object.values(hrPermissions.policies).map((name) => ({
          name,
          isGranted: true,
        })),
      }),
    },
  });
  mocks.ctx = {
    tab: 'calendars',
    setTab: vi.fn(),
    drawer: { kind, mode },
    closeDrawer: vi.fn(),
    calendarForm: { name: 'Original' },
    attendanceForm: { name: 'Original' },
    payrollForm: { name: 'Original' },
    assignmentForm: { targetKey: 'staff-1' },
    academicYearId: 'year-1',
    currentYear: { name: '2026' },
  };
  const ui = () => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ProgressBar />
        <nav aria-label="HR navigation">
          <a
            href="/hr/payrollPolicies"
            onClick={(event) => {
              if (event.defaultPrevented) return;
              event.preventDefault();
              mocks.push('/hr/payrollPolicies');
            }}
          >
            Payroll Policies
          </a>
        </nav>
        <HRPolicyWorkspace focus="calendars" />
      </ThemeProvider>
    </Provider>
  );
  const view = render(ui());
  return { store, view, rerender: () => view.rerender(ui()) };
}

beforeEach(() => {
  vi.restoreAllMocks();
  mocks.push.mockReset();
  mocks.back.mockReset();
  Object.defineProperty(window, 'confirm', { configurable: true, value: vi.fn() });
});

describe('policy workspace draft navigation', () => {
  it.each(['Header close', 'Footer cancel', 'Escape', 'Backdrop'])(
    'protects dirty drafts through %s and only discards explicitly',
    async (route) => {
      const { rerender, store } = setup('calendar');
      mocks.ctx.calendarForm = { name: 'Changed' };
      rerender();
      const dismiss = () => {
        if (route === 'Escape')
          fireEvent.keyDown(document.querySelector('.MuiDrawer-root')!, {
            key: 'Escape',
            code: 'Escape',
          });
        else if (route === 'Backdrop')
          fireEvent.click(document.querySelector('.MuiDrawer-root .MuiBackdrop-root')!);
        else fireEvent.click(screen.getByRole('button', { name: route }));
      };
      dismiss();
      expect(mocks.ctx.closeDrawer).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: 'Discard Unsaved Changes?' })
        ).not.toBeInTheDocument()
      );
      expect(mocks.ctx.calendarForm.name).toBe('Changed');
      expect(store.getState().confirmPopup.isChanges).toBe(true);
      dismiss();
      fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
      expect(mocks.ctx.closeDrawer).toHaveBeenCalledOnce();
      mocks.ctx.drawer = null;
      rerender();
      expect(store.getState().confirmPopup.isChanges).toBe(false);
    }
  );

  it('closes a clean draft without prompting and locks every close during operations', () => {
    const { rerender } = setup('calendar');
    fireEvent.click(screen.getByRole('button', { name: 'Header close' }));
    expect(mocks.ctx.closeDrawer).toHaveBeenCalledOnce();
    mocks.ctx.closeDrawer.mockClear();
    mocks.ctx.calendarForm = { name: 'Changed' };
    mocks.ctx.isPolicyOperationActive = true;
    rerender();
    fireEvent.click(screen.getByRole('button', { name: 'Footer cancel' }));
    expect(mocks.ctx.closeDrawer).not.toHaveBeenCalled();
    expect(screen.queryByText('Discard Unsaved Changes?')).not.toBeInTheDocument();
  });
  it.each(['calendar', 'attendance', 'payroll', 'assignment'])(
    'retains a changed %s draft when leaving is declined',
    async (kind) => {
      const { store, rerender } = setup(kind);
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
      const field = kind === 'assignment' ? 'targetKey' : 'name';
      mocks.ctx[`${kind}Form`] = { [field]: 'Changed' };
      rerender();
      fireEvent(window, new PopStateEvent('popstate'));
      expect(confirm).toHaveBeenCalled();
      expect(mocks.push).not.toHaveBeenCalled();
      expect(mocks.back).not.toHaveBeenCalled();
      expect(store.getState().confirmPopup.isChanges).toBe(true);
      const payrollLink = screen.getByRole('link', { name: 'Payroll Policies', hidden: true });
      fireEvent.click(payrollLink);
      expect(mocks.push).not.toHaveBeenCalled();
      confirm.mockReturnValue(true);
      fireEvent.click(payrollLink);
      expect(mocks.push).toHaveBeenCalledWith('/hr/payrollPolicies');
      expect(store.getState().confirmPopup.isChanges).toBe(false);
    }
  );

  it('clears the guard after resetting, closing, reopening and unmounting a drawer', async () => {
    const { store, rerender, view } = setup('payroll');
    mocks.ctx.payrollForm = { name: 'Changed' };
    rerender();
    await waitFor(() => expect(store.getState().confirmPopup.isChanges).toBe(true));
    mocks.ctx.payrollForm = { name: 'Original' };
    rerender();
    expect(store.getState().confirmPopup.isChanges).toBe(false);
    mocks.ctx.payrollForm = { name: 'Changed' };
    rerender();
    mocks.ctx.drawer = null;
    rerender();
    expect(store.getState().confirmPopup.isChanges).toBe(false);
    mocks.ctx.drawer = { kind: 'payroll', mode: 'edit' };
    rerender();
    expect(store.getState().confirmPopup.isChanges).toBe(false);
    mocks.ctx.payrollForm = { name: 'Second change' };
    rerender();
    expect(store.getState().confirmPopup.isChanges).toBe(true);
    view.unmount();
    expect(store.getState().confirmPopup.isChanges).toBe(false);
  });

  it('does not mark a view-only assignment as dirty', async () => {
    const { store, rerender } = setup('assignment', 'view');
    mocks.ctx.assignmentForm = { targetKey: 'staff-2' };
    rerender();
    expect(store.getState().confirmPopup.isChanges).toBe(false);
  });

  it('does not clear another form guard when no workspace drawer is open', () => {
    const { store, rerender } = setup('assignment', 'view');
    mocks.ctx.drawer = null;
    rerender();
    store.dispatch(setIsChanges(true));
    mocks.ctx.assignmentForm = { targetKey: 'background-update' };
    rerender();
    expect(store.getState().confirmPopup.isChanges).toBe(true);
  });
});
