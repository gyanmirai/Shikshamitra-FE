import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
  return render(
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BankAccountForm open onClose={vi.fn()} editData={{ ...account, ...overrides }} />
    </LocalizationProvider>
  );
}

const fromField = () => screen.getByRole('group', { name: /Effective from/ });
const toField = () => screen.getByRole('group', { name: /Effective to/ });

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

  it('blocks submission of an incomplete optional end date instead of saving it as empty', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(within(toField()).getByRole('spinbutton', { name: /Day/ }));
    await user.keyboard('25');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(await screen.findByText('Effective to must be a valid date (DD/MM/YYYY)')).toBeVisible();
    expect(within(toField()).getByRole('spinbutton', { name: /Day/ })).toHaveTextContent('25');
    expect(save).not.toHaveBeenCalled();
  });

  it('revalidates the end date when the start changes and accepts an inclusive same-day range', async () => {
    const user = userEvent.setup();
    renderForm({ effectiveTo: '2026-10-24T23:59:59Z' });
    // Touch the end before changing the start, so dependent errors must refresh.
    await user.click(within(toField()).getByRole('spinbutton', { name: /Day/ }));
    await user.tab();
    await user.click(within(fromField()).getByRole('spinbutton', { name: /Day/ }));
    await user.keyboard('25');
    await user.tab();
    expect(
      await screen.findByText('Effective to must be on or after effective from')
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(save).not.toHaveBeenCalled();
    await user.click(within(toField()).getByRole('spinbutton', { name: /Day/ }));
    await user.keyboard('25');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({
        bankAccountId: 'bank',
        body: expect.objectContaining({
          effectiveFrom: '2026-10-25T00:00:00.000Z',
          effectiveTo: '2026-10-25T23:59:59.000Z',
        }),
      })
    );
  });

  it('blocks an impossible typed date and permits a valid leap day after correction', async () => {
    const user = userEvent.setup();
    renderForm({ effectiveFrom: '2028-02-29T00:00:00Z' });
    await user.click(within(fromField()).getByRole('spinbutton', { name: /Year/ }));
    await user.keyboard('2027');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Update' }));
    expect(
      await screen.findByText('Effective from must be a valid date (DD/MM/YYYY)')
    ).toBeVisible();
    expect(save).not.toHaveBeenCalled();
    await user.click(within(fromField()).getByRole('spinbutton', { name: /Year/ }));
    await user.keyboard('2028');
    await user.tab();
    await user.click(screen.getByRole('button', { name: 'Update' }));
    await waitFor(() => expect(save).toHaveBeenCalled());
  });
});
