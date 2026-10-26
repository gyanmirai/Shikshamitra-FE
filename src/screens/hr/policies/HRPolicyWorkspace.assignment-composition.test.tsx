import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, beforeEach } from 'vitest';
import { hrPermissions } from 'src/constants/hr-menus';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { extendTheme, ThemeProvider } from '@mui/material/styles';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import HRPolicyWorkspace from './HRPolicyWorkspace';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  discard: vi.fn(),
  busy: false,
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-breadcrumbs', () => ({ CustomBreadcrumbs: () => null }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [() => ({ unwrap: async () => ({ items: [] }) })],
}));
vi.mock('./hooks/useHRPolicyWorkspace', () => ({
  useHRPolicyWorkspace: () => useFixtureWorkspace(),
}));
vi.mock('./components/AssignmentsTab', () => ({ AssignmentsTab: () => null }));
vi.mock('./components/CalendarsTab', () => ({ CalendarsTab: () => null }));
vi.mock('./components/PolicyTable', () => ({ PolicyTable: () => null }));
vi.mock('./components/LeavePoliciesPanel', () => ({ LeavePoliciesPanel: () => null }));
vi.mock('./components/PolicyAuditDrawer', () => ({ PolicyAuditDrawer: () => null }));
vi.mock('./components/PolicyVersionDrawer', () => ({ PolicyVersionDrawer: () => null }));
vi.mock('./components/ManualHolidayDialog', () => ({ ManualHolidayDialog: () => null }));

const conflict = {
  assignmentId: 'conflict-1',
  targetType: 'group',
  targetKey: 'group-2',
  targetDisplayName: 'Competing group',
  payrollPolicyId: 'payroll-1',
  payrollPolicyName: 'Payroll',
  attendancePolicyId: 'attendance-1',
  attendancePolicyName: 'Attendance',
  leavePolicyId: 'leave-1',
  leavePolicyName: 'Leave',
  effectiveFrom: '2026-04-01',
  priority: 200,
};

// Only transport/state is substituted. The workspace, drawers, field wrappers,
// autocomplete, segmented date fields and confirmation dialogs are production components.
function useFixtureWorkspace() {
  const [drawer, setDrawer] = React.useState<any>({ kind: 'assignment', mode: 'create' });
  const [assignmentForm, setAssignmentForm] = React.useState({
    targetType: 'employee',
    targetKey: 'staff-1',
    targetDisplayName: 'Synthetic staff',
    payrollPolicyId: 'payroll-1',
    attendancePolicyId: 'attendance-1',
    leavePolicyId: 'leave-1',
    effectiveFrom: '2026-04-01',
    effectiveTo: '',
    priority: '100',
    assignmentReason: '',
    isActive: true,
  });
  const [impactDrawerOpen, setImpactOpen] = React.useState(false);
  const closeDrawer = () => {
    if (!mocks.busy) setDrawer(null);
  };
  return {
    drawer,
    assignmentForm,
    setAssignmentForm,
    closeDrawer,
    discardDrawer: () => {
      if (mocks.busy) return false;
      mocks.discard();
      closeDrawer();
      return true;
    },
    tab: 'assignments',
    academicYearId: 'year-1',
    currentYear: { name: '2026' },
    drawerTransitionDuration: 0,
    isPolicyOperationActive: mocks.busy,
    setEmployeeLookupSearch: vi.fn(),
    setAssignmentDateError: vi.fn(),
    assignmentDateError: 'End date must be on or after start date.',
    employeeOptions: [{ id: 'staff-1', label: 'Synthetic staff' }],
    groupOptions: [{ id: 'group-1', name: 'Synthetic group' }],
    activePayroll: [{ id: 'payroll-1', name: 'Payroll' }],
    activeAttendance: [{ id: 'attendance-1', name: 'Attendance' }],
    activeLeavePolicies: [{ id: 'leave-1', name: 'Leave' }],
    leaveSetupState: 'missing',
    canOpenLeavePolicies: true,
    createAssignmentState: {},
    updateAssignmentState: {},
    previewPolicyAssignmentImpactState: {},
    previewPolicyImpactState: {},
    canAssignPolicy: true,
    canPreviewImpact: true,
    previewCurrentAssignmentImpact: () => setImpactOpen(true),
    impactDrawerOpen,
    closeImpactDrawer: () => setImpactOpen(false),
    openAssignmentDrawer: mocks.replace,
    impactPreview: {
      policyType: 'assignment',
      action: 'create',
      affectedEmployeeCount: 1,
      affectedAssignmentCount: 1,
      warnings: [
        {
          code: 'conflict',
          severity: 'blocking',
          message: 'Resolve the assignment conflict.',
          conflict,
        },
      ],
      blockingWarnings: [
        {
          code: 'conflict',
          severity: 'blocking',
          message: 'Resolve the assignment conflict.',
          conflict,
        },
      ],
    },
  } as any;
}

function setup() {
  const store = configureStore({
    reducer: {
      confirmPopup,
      auth: () => ({
        permissions: Object.values(hrPermissions.policies).map((name) => ({
          name,
          isGranted: true,
        })),
      }),
      globalState: () => ({ currentYear: { id: 'year-1' } }),
    },
  });
  render(
    <Provider store={store}>
      <ThemeProvider
        theme={extendTheme({
          customShadows: { z1: 'none' },
          colorSchemes: { light: { palette: { grey: { '500Channel': '145 158 171' } } } },
        } as any)}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <HRPolicyWorkspace focus="assignments" />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
  return store;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.busy = false;
});

it('names real composite staff/group and date fields, and associates date validation', async () => {
  setup();
  expect(screen.getByRole('combobox', { name: 'Staff *' })).toHaveValue('Synthetic staff');
  expect(screen.getByRole('combobox', { name: 'Target Type' })).toBeInTheDocument();
  const from = screen.getByRole('group', { name: 'Effective From *' });
  const to = screen.getByRole('group', { name: 'Effective To (optional)' });
  expect(from).toHaveAccessibleDescription('End date must be on or after start date.');
  expect(to).toHaveAccessibleDescription('End date must be on or after start date.');
  expect(within(from).getAllByRole('spinbutton')).toHaveLength(3);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Target Type' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Group' }));
  expect(screen.getByRole('combobox', { name: 'Group *' })).toBeInTheDocument();
});

it('inspects a conflict separately and returns to the same dirty proposal', async () => {
  const store = setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Reason' }), {
    target: { value: 'Unsaved proposal' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Preview impact' }));
  fireEvent.click(await screen.findByRole('button', { name: 'View conflict' }));
  const details = screen.getByRole('dialog', { name: 'Conflicting assignment' });
  expect(within(details).getByText('Competing group')).toBeVisible();
  expect(mocks.replace).not.toHaveBeenCalled();
  fireEvent.click(within(details).getByRole('button', { name: 'Return to impact' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Conflicting assignment' })).not.toBeInTheDocument()
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'close' }).at(-1)!);
  expect(await screen.findByRole('textbox', { name: 'Reason' })).toHaveValue('Unsaved proposal');
  expect(store.getState().confirmPopup.isChanges).toBe(true);
});

it('keeps navigation cancelable and uses exactly one explicit discard consent', async () => {
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: 'Reason' }), {
    target: { value: 'Keep this draft' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Open Leave Policies' }));
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  await waitFor(() => expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument());
  expect(mocks.push).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Reason' })).toHaveValue('Keep this draft');
  fireEvent.click(screen.getByRole('button', { name: 'Open Leave Policies' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard and open Leave Policies' }));
  await waitFor(() => expect(screen.queryByText('Discard changes?')).not.toBeInTheDocument());
  expect(mocks.discard).toHaveBeenCalledOnce();
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith('/hr/leave-policies');
  expect(screen.queryByText('Discard Unsaved Changes?')).not.toBeInTheDocument();
});
