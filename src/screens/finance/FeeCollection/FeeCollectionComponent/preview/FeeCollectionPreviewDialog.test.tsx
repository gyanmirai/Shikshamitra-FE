import dayjs from 'dayjs';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';

import FeeCollectionPreviewDialog from './FeeCollectionPreviewDialog';

vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: any) => (open ? <div role="dialog">{children}</div> : null),
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('shows entered bank transfer evidence and the bank label in Payment Details', () => {
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <FeeCollectionPreviewDialog
        {...({
          open: true,
          onClose: vi.fn(),
          onConfirm: vi.fn(),
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
  expect(screen.getByText('N2026BANKQA001')).toBeVisible();
  expect(screen.getByText('20/10/2026')).toBeVisible();
  expect(screen.getByText('Bank Transfer QA Holder')).toBeVisible();
  expect(screen.getByText('SBI • 9384')).toBeVisible();
  expect(screen.queryByText('school-bank-id')).toBeNull();
});
