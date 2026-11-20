import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import FeeCollectionPreviewDialog from './FeeCollectionPreviewDialog';
import { allocatePayment, summarizeFundedAllocations } from './paymentAllocationUtils';

it('sums funded installments by fee head and omits unfunded fees', () => {
  const fees = [
    { dueFeeId: 'reg-june', feeHeadId: 'reg', period: '2026-06', dueAmount: 7493 },
    { dueFeeId: 'reg-july', feeHeadId: 'reg', period: '2026-07', dueAmount: 7497 },
    { dueFeeId: 'reg-august', feeHeadId: 'reg', period: '2026-08', dueAmount: 7497 },
    { dueFeeId: 'tuition', feeHeadId: 'tuition', period: '2026-06', dueAmount: 9996 },
  ];
  expect(
    summarizeFundedAllocations(
      allocatePayment(fees, [], { reg: 'Registration Fee' }, 10000).allocatedRows
    )
  ).toEqual([
    {
      id: 'fee:reg',
      name: 'Registration Fee',
      periods: ['Jun 2026', 'Jul 2026'],
      originalAmount: 14990,
      paidAmount: 10000,
      remainingAmount: 4990,
    },
  ]);
});

vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
  DialogScrollContent: ({ children }: any) => children,
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('shows bank transfer evidence and records a provisional receipt from the same review', () => {
  const onConfirm = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FeeCollectionPreviewDialog
        {...({
          open: true,
          onClose: vi.fn(),
          onConfirm,
          student: null,
          chargesData: [],
          feeHeadMap: {},
          bankAccounts: [{ id: 'school-bank-id', name: 'SBI • 9384' }],
          formValues: {
            selectedItems: [],
            charges: [],
            remarks: '',
            payment: {
              paymentMethod: 'Bank Transfer (NEFT/RTGS/IMPS)',
              amount: '250',
              details: {
                transactionId: 'N2026BANKQA001',
                transferDate: dayjs('2026-10-20'),
                accountHolderName: 'Bank Transfer QA Holder',
                bankAccount: 'school-bank-id',
              },
            },
          },
        } as any)}
      />
    </ThemeProvider>
  );
  expect(screen.getByText('Reference Details')).toBeVisible();
  expect(screen.getByText('Bank Transfer (NEFT/RTGS/IMPS)')).toBeVisible();
  expect(screen.getByText('N2026BANKQA001')).toBeVisible();
  expect(screen.getByText('20/10/2026')).toBeVisible();
  expect(screen.getByText('Bank Transfer QA Holder')).toBeVisible();
  expect(screen.getByText('SBI • 9384')).toBeVisible();
  expect(screen.queryByText('school-bank-id')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Record & issue provisional receipt' }));
  expect(onConfirm).toHaveBeenCalledOnce();
});
