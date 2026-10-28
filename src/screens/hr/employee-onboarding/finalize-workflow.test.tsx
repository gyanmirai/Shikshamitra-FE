import { useState, useEffect } from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { hrPermissions } from 'src/constants/hr-menus';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import { FinalizeWorkflow } from './finalize-workflow';
import { getLocalMonthKey } from '../payroll/structure/salary-structure-builder-utils';

const mocks = vi.hoisted(() => ({
  finalize: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  onFinalized: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: mocks.error, success: mocks.success, warning: mocks.warning },
}));
const role = {
  id: 'teacher-role',
  name: 'Teacher',
  roleAudience: 'Employee',
  employeeOnboardingAssignable: true,
  employeeGroupAudience: 'Teaching',
};
const organizations = [1, 2, 3, 4].map((number) => ({
  id: `stage-${number}`,
  name: `Organization ${number}`,
  label: `Organization ${number}`,
  boardId: 'board',
  mediumId: 'medium',
  boardName: `Board ${number}`,
  mediumName: 'Medium',
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push, replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
  useSelector: (select: any) =>
    select({
      confirmPopup: { isChanges: false },
      globalState: { currentYear: { id: 'year', name: 'Current academic year' } },
      auth: {
        permissions: [
          hrPermissions.payroll.compensationRevisionActions.manage,
          hrPermissions.payroll.settings.statutorySchemeActions.manageEnrollment,
        ].map((name) => ({ name, isGranted: true })),
      },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/phone-input', () => ({ default: () => null }));
vi.mock('src/components/stardard-address/country-component', () => ({ default: () => null }));
vi.mock('src/components/stardard-address/state-component', () => ({ default: () => null }));
vi.mock('src/components/stardard-address/city-component', () => ({ default: () => null }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('input-otp', () => ({
  REGEXP_ONLY_DIGITS: '',
  REGEXP_ONLY_DIGITS_AND_CHARS: '',
  OTPInput: ({ value, onChange, maxLength }: any) => (
    <input
      data-testid={maxLength === 12 ? 'aadhaar-input' : 'pan-input'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));
vi.mock('src/redux/shiftManagement/shift-management-api', () => ({
  useGetShiftsQuery: () => ({
    data: { items: [{ id: 'shift', name: 'Day shift' }] },
    isLoading: false,
  }),
}));
vi.mock('src/screens/hr/hooks/useAcademicOrganizationOptions', () => ({
  useAcademicOrganizationOptions: () => ({
    options: organizations,
    byId: new Map(organizations.map((item) => [item.id, item])),
    isLoading: false,
  }),
}));
vi.mock('./work-assignment-field', () => ({
  default: function WorkAssignmentFixture({ onValidityChange, confirmation }: any) {
    useEffect(() => onValidityChange(true), [onValidityChange]);
    return (
      <>
        <p>Work assignment fixture</p>
        {/* Also supports the confirmation owned by the pending shared assignment field. */}
        {confirmation && (
          <label htmlFor="fixture-assignment-confirmed">
            <input
              id="fixture-assignment-confirmed"
              type="checkbox"
              checked={confirmation.checked}
              onChange={(event) => confirmation.onChange(event.target.checked)}
            />
            I confirm this work assignment. Access permissions are reviewed separately.
          </label>
        )}
      </>
    );
  },
}));
vi.mock('./finalize-role-field', () => ({
  useFinalizeRoles: () => ({
    ready: true,
    selectionError: undefined,
    query: { data: { items: [role] } },
  }),
  FinalizeRoleField: ({ value, onChange }: any) => (
    <label htmlFor="fixture-role">
      Role
      <select id="fixture-role" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>
        <option value="teacher-role">Teacher</option>
      </select>
    </label>
  ),
}));
vi.mock('src/redux/hr/employeeOnboardingApi', async (importOriginal) => ({
  ...(await importOriginal<any>()),
  useFinalizeEmployeeApplicationMutation: () => [mocks.finalize, { isLoading: false }],
}));
vi.mock('../payroll/structure/SalaryStructureBuilder', () => ({
  SalaryStructureBuilder: ({ onboarding, onEditorStateChange }: any) => {
    const [amount, setAmount] = useState('');
    useEffect(
      () => onEditorStateChange({ dirty: Boolean(amount), busy: false }),
      [amount, onEditorStateChange]
    );
    return (
      <>
        <label htmlFor="fixture-salary">
          Salary draft
          <input
            id="fixture-salary"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value);
              onboarding.onSalaryChange(null);
            }}
          />
        </label>
        <button
          type="button"
          onClick={() =>
            onboarding.onSalaryChange({
              effectiveMonth: `${getLocalMonthKey()}-01T00:00:00.000Z`,
              monthlyAmount: Number(amount),
              idempotencyKey: 'onboarding',
            })
          }
        >
          Prepare salary preview
        </button>
      </>
    );
  },
}));

const application: any = {
  id: '11111111-1111-1111-1111-111111111111',
  fullName: 'Synthetic Candidate',
  firstName: 'Synthetic',
  lastName: 'Candidate',
  status: 5,
  hasPhoto: false,
  hasResume: false,
  workAssignment: { mode: 'decideLater', academicYearId: null, organizationIds: [] },
  personalInfo: {
    firstName: 'Synthetic',
    lastName: 'Candidate',
    dateOfBirth: '1990-01-01',
    gender: 2,
    religion: 0,
    casteType: 0,
    familyCaste: 'General',
    maritalStatus: 0,
    email: 'synthetic@example.test',
    mobileNo: '9876543210',
    isTeaching: true,
    address1: 'Test building',
    address2: 'Test road',
    country: { name: 'India', isoCode: 'IN' },
    state: { name: 'Gujarat', isoCode: 'GJ' },
    city: 'Test city',
    pincode: '380001',
  },
};
const theme = createTheme(defaultSettings);
const content = (readReady = true) => (
  <ThemeProvider theme={theme}>
    <FinalizeWorkflow
      application={application}
      returnHref="/hr/employee/onboarding?page=2"
      readReady={readReady}
      readError={!readReady}
      onRetry={() => {}}
      onFinalized={mocks.onFinalized}
    />
    <a href="/other">Other page</a>
  </ThemeProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.finalize.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        employee: { id: 'staff', fullName: 'Synthetic Candidate' },
        application: { finalizedEmployeeId: 'staff' },
        activationReadiness: { compensationRevisionId: 'revision' },
      }),
  });
});

async function academicStep(user: ReturnType<typeof userEvent.setup>) {
  const confirm = await screen.findByRole('checkbox', { name: /I confirm this work assignment/ });
  await waitFor(() => expect(confirm).toBeEnabled());
  await user.click(confirm);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByTestId('aadhaar-input'), '999999999999');
  await user.type(screen.getByTestId('pan-input'), 'ABCDE1234F');
  await user.selectOptions(screen.getByLabelText('Role'), 'teacher-role');
  fireEvent.mouseDown(screen.getByLabelText('Shift *'));
  await user.click(await screen.findByRole('option', { name: 'Day shift' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('checkbox', { name: /Organization 1/ });
}

it('uses the real full-card native labels in the page, with one toggle from text, subtitle, blank area and keyboard', async () => {
  const user = userEvent.setup();
  const rendered = render(content());
  await academicStep(user);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const first = screen.getByRole('checkbox', { name: /Organization 1/ });
  const label = first.closest('label')!;
  expect(label).toBeTruthy();
  expect(label.querySelectorAll('input')).toHaveLength(1);
  expect(label.querySelector('a, button')).toBeNull();
  await user.click(label);
  expect(first).toBeChecked();
  await user.click(within(label).getByText('Organization 1'));
  expect(first).not.toBeChecked();
  await user.click(within(label).getByText('Medium · Board 1'));
  expect(first).toBeChecked();
  await user.click(first);
  expect(first).not.toBeChecked();
  first.focus();
  await user.keyboard(' ');
  expect(first).toBeChecked();
  await user.keyboard('{Enter}');
  expect(first).not.toBeChecked();
  const second = screen.getByRole('checkbox', { name: /Organization 2/ });
  await user.click(second.closest('label')!);
  expect(second).toBeChecked();
  expect(first).not.toBeChecked();
  rendered.rerender(content(false));
  expect(second).toBeDisabled();
  await user.click(second.closest('label')!);
  expect(second).toBeChecked();
  rendered.rerender(content());
  expect(second).toBeChecked();
  expect(mocks.finalize).not.toHaveBeenCalled();
});

it('preserves staff and salary drafts across steps and safe dirty departure, retaining required finalization gates', async () => {
  const user = userEvent.setup();
  render(content());
  await academicStep(user);
  await user.click(screen.getByRole('checkbox', { name: /Organization 1/ }).closest('label')!);
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('button', { name: 'Finalize' })).toBeDisabled();
  await user.type(screen.getByLabelText('Salary draft'), '12000');
  await user.click(screen.getAllByRole('button', { name: 'Back' }).at(-1)!);
  await user.click(screen.getAllByRole('button', { name: 'Back' }).at(-1)!);
  expect(screen.getByTestId('pan-input')).toHaveValue('ABCDE1234F');
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByRole('checkbox', { name: /Organization 1/ })).toBeChecked();
  await user.click(screen.getByRole('button', { name: 'Next' }));
  expect(screen.getByLabelText('Salary draft')).toHaveValue('12000');
  await user.click(screen.getByRole('link', { name: 'Other page' }));
  expect(await screen.findByRole('dialog')).toHaveTextContent('Discard unsaved changes');
  await user.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByLabelText('Salary draft')).toHaveValue('12000');
  expect(mocks.push).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Prepare salary preview' }));
  expect(screen.getByRole('button', { name: 'Finalize' })).toBeEnabled();
  expect(mocks.finalize).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await user.click(await screen.findByRole('button', { name: 'Discard changes' }));
  expect(mocks.push).toHaveBeenCalledWith('/hr/employee/onboarding?page=2');
});

it('locks leaving and repeat submission while saving, and keeps a confirmed success terminal before navigation', async () => {
  let finish!: (value: any) => void;
  mocks.finalize.mockReturnValue({
    unwrap: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  const user = userEvent.setup();
  render(content());
  await academicStep(user);
  await user.click(screen.getByRole('checkbox', { name: /Organization 1/ }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByLabelText('Salary draft'), '12000');
  await user.click(screen.getByRole('button', { name: 'Prepare salary preview' }));
  const finalize = screen.getByRole('button', { name: 'Finalize' });
  fireEvent.click(finalize);
  fireEvent.click(finalize);
  await waitFor(() => expect(mocks.finalize).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('breadcrumb-back')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await act(async () =>
    finish({
      employee: { id: 'staff' },
      application: {},
      activationReadiness: { compensationRevisionId: 'revision' },
    })
  );
  expect(mocks.onFinalized).toHaveBeenCalledOnce();
  fireEvent.click(finalize);
  expect(mocks.finalize).toHaveBeenCalledTimes(1);
  expect(
    screen.getAllByRole('alert').some((alert) => alert.textContent?.includes('remain inactive'))
  ).toBe(true);
});

it('retains the salary/staff draft after server failure, supports deliberate retry and ignores completion after unmount', async () => {
  mocks.finalize.mockReturnValueOnce({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Synthetic server validation failure'), {
          data: { error: { message: 'Synthetic server validation failure' } },
        })
      ),
  });
  const user = userEvent.setup();
  const mounted = render(content());
  await academicStep(user);
  await user.click(screen.getByRole('checkbox', { name: /Organization 1/ }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.type(screen.getByLabelText('Salary draft'), '12000');
  await user.click(screen.getByRole('button', { name: 'Prepare salary preview' }));
  await user.click(screen.getByRole('button', { name: 'Finalize' }));
  await waitFor(() => expect(mocks.error).toHaveBeenCalled());
  expect(screen.getByLabelText('Salary draft')).toHaveValue('12000');
  expect(screen.getByRole('button', { name: 'Finalize' })).toBeEnabled();
  expect(mocks.onFinalized).not.toHaveBeenCalled();
  let finish!: (value: any) => void;
  mocks.finalize.mockReturnValueOnce({
    unwrap: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  await user.click(screen.getByRole('button', { name: 'Finalize' }));
  await waitFor(() => expect(mocks.finalize).toHaveBeenCalledTimes(2));
  mounted.unmount();
  await act(async () =>
    finish({
      employee: { id: 'staff' },
      application: {},
      activationReadiness: { compensationRevisionId: 'revision' },
    })
  );
  expect(mocks.onFinalized).not.toHaveBeenCalled();
});
