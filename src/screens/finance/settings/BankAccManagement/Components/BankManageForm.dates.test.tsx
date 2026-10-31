import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import BankAccountForm from './BankManageForm';
import { bankAccountValidationSchema } from './BankValidationSchema';

import type { IBankAccount } from './type';

const { save, unwrap } = vi.hoisted(() => ({ save: vi.fn(), unwrap: vi.fn() }));

vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ globalState: { currentYear: { id: 'year' } } }),
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [save, { isLoading: false }],
}));
vi.mock('src/redux/finance/BankAccountManage/bankAccountApi', () => ({
  usePutBankAccountMutation: vi.fn(),
  usePostBankAccountMutation: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/screens/finance/settings/components/DownstreamUsageWarning', () => ({
  default: () => null,
}));

const account = {
  id: 'bank',
  bankName: 'Example bank',
  branchName: 'Example branch',
  accountHolderName: 'Example school',
  accountType: 0,
  accountNumber: '0012345678',
  ifscCode: 'SBIN0123456',
  effectiveFrom: '2026-10-24T00:00:00Z',
  effectiveTo: null,
  concurrencyStamp: 'version',
} as IBankAccount;

function renderForm(overrides: Partial<IBankAccount> = {}) {
  return render(<BankAccountForm open onClose={vi.fn()} editData={{ ...account, ...overrides }} />);
}

beforeEach(() => {
  save.mockReset().mockReturnValue({ unwrap });
  unwrap.mockReset().mockResolvedValue({});
});

describe('bank account effective dates', { timeout: 30000 }, () => {
  it('requires the start date and rejects invalid optional dates at validation', async () => {
    await expect(
      bankAccountValidationSchema.validateAt('effectiveFrom', { effectiveFrom: null })
    ).rejects.toThrow('Effective from is required');
    await expect(
      bankAccountValidationSchema.validateAt('effectiveTo', { effectiveTo: dayjs('invalid') })
    ).rejects.toThrow('Effective to must be a valid date');
    await expect(
      bankAccountValidationSchema.validateAt('effectiveTo', { effectiveTo: null })
    ).resolves.toBeNull();
  });

  it.each(['1899-12-31', '2100-01-01'])(
    'rejects a typed date outside the common picker range: %s',
    async (date) => {
      await expect(
        bankAccountValidationSchema.validateAt('effectiveFrom', { effectiveFrom: dayjs(date) })
      ).rejects.toThrow('Effective from must be between');
    }
  );

  it('saves the selected calendar day at the existing UTC boundary with no optional end', async () => {
    const user = userEvent.setup();
    renderForm({ effectiveFrom: '2026-10-24T00:00:00+05:30' });
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        bankAccountId: 'bank',
        body: expect.objectContaining({
          effectiveFrom: '2026-10-24T00:00:00.000Z',
          effectiveTo: null,
        }),
      })
    );
  });

  it('removes effective-date controls from create and edit forms', () => {
    const { unmount } = renderForm();
    expect(screen.queryByText(/Effective from/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Effective to/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    unmount();

    render(<BankAccountForm open onClose={vi.fn()} editData={null} />);
    expect(screen.queryByText(/Effective from/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Effective to/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('preserves the existing effective period when editing other account details', async () => {
    const user = userEvent.setup();
    renderForm({ effectiveTo: '2027-03-31T23:59:59Z' });
    await user.clear(screen.getByLabelText('Bank Name *'));
    await user.type(screen.getByLabelText('Bank Name *'), 'Updated bank');
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        bankAccountId: 'bank',
        body: expect.objectContaining({
          bankName: 'Updated bank',
          effectiveFrom: '2026-10-24T00:00:00.000Z',
          effectiveTo: '2027-03-31T23:59:59.000Z',
          concurrencyStamp: 'version',
        }),
      })
    );
  });

  it('creates an account with the existing default start date and no end date', async () => {
    const user = userEvent.setup();
    const today = dayjs().format('YYYY-MM-DD');
    render(<BankAccountForm open onClose={vi.fn()} editData={null} />);
    fireEvent.change(screen.getByLabelText('Bank Name *'), { target: { value: account.bankName } });
    fireEvent.change(screen.getByLabelText('Branch Name *'), {
      target: { value: account.branchName },
    });
    fireEvent.change(screen.getByLabelText('Account Holder Name *'), {
      target: { value: account.accountHolderName },
    });
    fireEvent.change(screen.getByLabelText('Account Number *'), {
      target: { value: account.accountNumber },
    });
    fireEvent.change(screen.getByLabelText('IFSC Code *'), { target: { value: account.ifscCode } });
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        academicYearId: 'year',
        body: expect.objectContaining({
          bankName: account.bankName,
          effectiveFrom: today + 'T00:00:00.000Z',
          effectiveTo: null,
        }),
      })
    );
  });
});
