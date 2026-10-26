import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import EmployeeFrom from './employee-form';

const mocks = vi.hoisted(() => ({
  save: vi.fn(),
  toast: vi.fn(),
  saveStatutory: vi.fn(),
  write: vi.fn(),
  newStaff: false,
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      auth: { permissions: [] },
      globalState: { currentYear: { id: 'year' } },
      confirmPopup: { isChanges: false },
    }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: mocks.toast, error: vi.fn() },
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: any) => (type === 'mutation' ? [mocks.write] : {}),
}));
vi.mock('src/redux/hr/hr-policy-api', () => ({
  useGetPayrollPoliciesQuery: () => ({}),
  useGetAttendancePoliciesQuery: () => ({}),
}));
vi.mock('src/redux/hr/leaveApi', () => ({ useGetLeavePoliciesQuery: () => ({}) }));
vi.mock('src/redux/permission/permissionApi', () => ({
  useLazyGetPermissionsQuery: () => [vi.fn()],
}));
vi.mock('./employee-form-fields', () => ({ allFields: [] }));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: any) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));
vi.mock('src/redux/hr/employee-payroll-profile-api', () => ({
  useUpdatePayrollProfileDetailsMutation: () => [mocks.save, {}],
}));
vi.mock('./payroll-profile-workspace', async () => {
  const { useState, useEffect, useImperativeHandle } = await import('react');
  return {
    PayrollProfileWorkspace: ({
      detailsContent,
      statutoryEditorRef,
      onStatutoryStateChange,
    }: any) => {
      const [dirty, setDirty] = useState(false);
      useEffect(
        () => onStatutoryStateChange?.({ dirty, busy: false }),
        [dirty, onStatutoryStateChange]
      );
      useImperativeHandle(statutoryEditorRef, () => ({
        save: async () => {
          if (!dirty) return true;
          const saved = await mocks.saveStatutory();
          if (saved) setDirty(false);
          return saved;
        },
      }));
      return (
        <>
          <button type="button" onClick={() => setDirty(true)}>
            Edit statutory registration
          </button>
          {detailsContent(
            {
              bankDetails: {
                bankName: 'Bank',
                branchName: '',
                accountHolderName: 'Staff',
                accountNumber: '1234567890',
                ifscCode: 'SBIN0001234',
              },
              statutoryIdentifiers: { epfNumber: '', uanNumber: '' },
              attendanceIntegration: { punchId: 'PUNCH', totalWorkingHourPerMonth: 160 },
            },
            true
          )}
        </>
      );
    },
  };
});
vi.mock('src/components/custom-stepper', async () => {
  const { useFormik } = await import('formik');
  return {
    CustomStepperWithFormik: ({
      initialValues,
      activeStep,
      renderItem,
      showSaveButton,
      onSave,
      saveAndNextButtonProps,
      handleNext,
    }: any) => {
      const formik = useFormik({
        initialValues: {
          ...initialValues,
          ...(mocks.newStaff
            ? {
                dob: dayjs('1990-01-01'),
                dateOfJoining: dayjs('2026-10-01'),
                firstName: 'Synthetic',
                lastName: 'Teacher',
              }
            : {}),
        },
        onSubmit: () => undefined,
      });
      return (
        <>
          <div data-testid="current-step">{activeStep}</div>
          {activeStep === 5 && renderItem({ activeStep: 5, formik })}
          {showSaveButton && (
            <button
              type="button"
              onClick={() => onSave(false, formik.values, formik, () => undefined)}
            >
              Save
            </button>
          )}
          <button
            type="button"
            disabled={saveAndNextButtonProps?.disabled}
            onClick={() => handleNext(false, formik.values, formik, () => undefined)}
          >
            Save & Next
          </button>
        </>
      );
    },
  };
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.newStaff = false;
  mocks.write.mockReturnValue({
    unwrap: async () => ({ id: 'created-staff', userId: 'created-user' }),
  });
  mocks.saveStatutory.mockResolvedValue(true);
  mocks.save.mockReturnValue({ unwrap: async () => undefined });
});

it('Add Staff reaches editable Payroll fields and persists them through Save & Next', async () => {
  mocks.newStaff = true;
  render(<EmployeeFrom handleClose={vi.fn()} />);
  const advance = async (step: number) => {
    fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
    await waitFor(() => expect(screen.getByTestId('current-step')).toHaveTextContent(String(step)));
  };
  await advance(1);
  await advance(2);
  await advance(3);
  await advance(4);
  await advance(5);
  expect(screen.getByLabelText('Bank name *')).toBeEnabled();
  fireEvent.change(screen.getByLabelText('Punch ID'), { target: { value: 'NEW-PUNCH' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await waitFor(() => expect(screen.getByTestId('current-step')).toHaveTextContent('6'));
  expect(mocks.save).toHaveBeenCalledWith({
    employeeId: 'created-staff',
    body: { attendanceIntegration: { punchId: 'NEW-PUNCH', totalWorkingHourPerMonth: 160 } },
  });
});
function setup() {
  render(
    <EmployeeFrom
      editData={{ id: 'staff', firstName: 'Test', fullName: 'Test Staff' }}
      initialStep={5}
      handleClose={vi.fn()}
    />
  );
}
it('advances the actual edit wizard without a write when payroll details are unchanged', async () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await waitFor(() => expect(screen.getByTestId('current-step')).toHaveTextContent('6'));
  expect(mocks.save).not.toHaveBeenCalled();
  expect(mocks.toast).not.toHaveBeenCalled();
});
it('Save persists the inline draft and stays on Payroll; Save & Next then advances without resaving', async () => {
  setup();
  fireEvent.change(screen.getByLabelText('Punch ID'), { target: { value: 'UPDATED' } });
  fireEvent.click(await screen.findByRole('button', { name: /^Save$/ }));
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: /^Save$/ })).not.toBeInTheDocument()
  );
  expect(screen.getByTestId('current-step')).toHaveTextContent('5');
  expect(mocks.save).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await waitFor(() => expect(screen.getByTestId('current-step')).toHaveTextContent('6'));
  expect(mocks.save).toHaveBeenCalledTimes(1);
});
it('keeps the wizard on Payroll and retains inputs when Save & Next fails', async () => {
  mocks.save.mockReturnValue({
    unwrap: async () => {
      throw new Error('Failed');
    },
  });
  setup();
  fireEvent.change(screen.getByLabelText('Punch ID'), { target: { value: 'DRAFT' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await screen.findByRole('alert');
  expect(screen.getByTestId('current-step')).toHaveTextContent('5');
  expect(screen.getByLabelText('Punch ID')).toHaveValue('DRAFT');
});

it('Save & Next persists a registration-only draft before advancing', async () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Edit statutory registration' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await waitFor(() => expect(screen.getByTestId('current-step')).toHaveTextContent('6'));
  expect(mocks.saveStatutory).toHaveBeenCalledTimes(1);
  expect(mocks.save).not.toHaveBeenCalled();
});
it('a failed registration save retains the Payroll step and never writes bank details', async () => {
  mocks.saveStatutory.mockResolvedValue(false);
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Edit statutory registration' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save & Next' }));
  await waitFor(() => expect(mocks.saveStatutory).toHaveBeenCalledTimes(1));
  expect(screen.getByTestId('current-step')).toHaveTextContent('5');
  expect(mocks.save).not.toHaveBeenCalled();
});
