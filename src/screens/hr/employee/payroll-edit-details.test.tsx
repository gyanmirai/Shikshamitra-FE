import { createRef } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { PayrollEditDetails, type PayrollEditHandle } from './payroll-edit-details';
import { staffPayrollEditHref, staffSalaryEditorHref } from './payroll-profile-utils';

const mocks = vi.hoisted(() => ({ update: vi.fn(), toast: vi.fn(), push: vi.fn() }));
vi.mock('src/redux/hr/employee-payroll-profile-api', () => ({
  useUpdatePayrollProfileDetailsMutation: () => [mocks.update, {}],
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('react-redux', () => ({
  useSelector: (selector: any) => selector({ confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: mocks.toast } }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ title, children }: any) => (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  ),
}));
const initial = {
  bankDetails: {
    bankName: 'Test bank',
    branchName: 'Main',
    accountHolderName: 'Staff',
    accountNumber: '1234567890',
    ifscCode: 'SBIN0001234',
  },
  statutoryIdentifiers: { epfNumber: 'legacy-format', uanNumber: '123456789012' },
  attendanceIntegration: { punchId: 'STAFF', totalWorkingHourPerMonth: 160 },
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.update.mockReturnValue({ unwrap: async () => undefined });
});
function setup(canEdit = true) {
  const ref = createRef<PayrollEditHandle>();
  const state = vi.fn();
  const view = render(
    <PayrollEditDetails
      ref={ref}
      employeeId="staff"
      initialValues={initial}
      canEdit={canEdit}
      onStateChange={state}
    />
  );
  return { ref, state, ...view };
}
async function save(ref: ReturnType<typeof createRef<PayrollEditHandle>>) {
  let result: boolean | undefined;
  await act(async () => {
    result = await ref.current?.save();
  });
  return result;
}
describe('inline staff payroll details', () => {
  it('allows unchanged continuation without an API write or success toast', async () => {
    const { ref } = setup();
    expect(await save(ref)).toBe(true);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.toast).not.toHaveBeenCalled();
  });
  it('saves only the changed group and resets the saved baseline', async () => {
    const { ref, state } = setup();
    fireEvent.change(screen.getByLabelText('Bank name *'), { target: { value: 'Updated bank' } });
    expect(await save(ref)).toBe(true);
    expect(mocks.update).toHaveBeenCalledWith({
      employeeId: 'staff',
      body: { bankDetails: { ...initial.bankDetails, bankName: 'Updated bank' } },
    });
    expect(state).toHaveBeenLastCalledWith({ dirty: false, busy: false, ready: true });
    expect(await save(ref)).toBe(true);
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });
  it('does not allow advancement after a failed save and retains the draft', async () => {
    mocks.update.mockReturnValue({
      unwrap: async () => {
        throw new Error('Save rejected');
      },
    });
    const { ref } = setup();
    fireEvent.change(screen.getByLabelText('Punch ID'), { target: { value: 'UNSAVED' } });
    expect(await save(ref)).toBe(false);
    expect(screen.getByLabelText('Punch ID')).toHaveValue('UNSAVED');
    expect(screen.getByRole('alert')).toBeVisible();
  });
  it('shows inline validation and focuses the first invalid changed field', async () => {
    const { ref } = setup();
    fireEvent.change(screen.getByLabelText('Account number *'), { target: { value: 'bad' } });
    expect(await save(ref)).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
    expect(screen.getByText('Enter 8 to 20 digits')).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('Account number *')).toHaveFocus());
  });
  it('does not replace an inline draft when policy invalidation refetches details', async () => {
    const { ref, state, rerender } = setup();
    fireEvent.change(screen.getByLabelText('Bank name *'), { target: { value: 'Local draft' } });
    rerender(
      <PayrollEditDetails
        ref={ref}
        employeeId="staff"
        initialValues={{
          ...initial,
          bankDetails: { ...initial.bankDetails, bankName: 'Server refresh' },
        }}
        canEdit
        onStateChange={state}
      />
    );
    expect(screen.getByLabelText('Bank name *')).toHaveValue('Local draft');
    expect(await save(ref)).toBe(true);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { bankDetails: { ...initial.bankDetails, bankName: 'Local draft' } },
      })
    );
  });
  it('locks fields and rejects duplicate requests while saving', async () => {
    let resolve!: () => void;
    mocks.update.mockReturnValue({
      unwrap: () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    });
    const { ref } = setup();
    fireEvent.change(screen.getByLabelText('Punch ID'), { target: { value: 'NEW' } });
    let pending!: Promise<boolean>;
    act(() => {
      pending = ref.current!.save();
    });
    expect(screen.getByLabelText('Punch ID')).toBeDisabled();
    expect(await save(ref)).toBe(false);
    expect(mocks.update).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve();
      await pending;
    });
  });
  it('protects an unsaved salary navigation link and can keep editing', async () => {
    setup();
    fireEvent.change(screen.getByLabelText('Punch ID'), { target: { value: 'DRAFT' } });
    const link = document.createElement('a');
    link.href = '/hr/payroll/structure';
    document.body.appendChild(link);
    fireEvent.click(link);
    expect(await screen.findByText('Discard unsaved changes?')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(mocks.push).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Punch ID')).toHaveValue('DRAFT');
    link.remove();
  });
  it('keeps unauthorized details read-only and allows unchanged continuation', async () => {
    const { ref } = setup(false);
    expect(screen.getByLabelText('Bank name *')).toBeDisabled();
    expect(await save(ref)).toBe(true);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('uses a reload-safe edit return route and leaves the profile origin as the default', () => {
    const route = new URL(staffPayrollEditHref('staff'), 'https://example.test');
    expect(Object.fromEntries(route.searchParams)).toEqual({
      mode: 'form',
      editEmployee: 'staff',
      step: 'payroll',
    });
    expect(
      new URL(staffSalaryEditorHref('staff', 'staff-edit'), 'http://localhost').searchParams.get(
        'returnTo'
      )
    ).toBe(staffPayrollEditHref('staff'));
    expect(
      new URL(staffSalaryEditorHref('staff'), 'http://localhost').searchParams.get('returnTo')
    ).toBe('/hr/employee?employee=staff&tab=personalInformation&infoTab=payroll');
  });
});
