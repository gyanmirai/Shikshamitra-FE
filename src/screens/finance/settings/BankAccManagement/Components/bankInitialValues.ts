import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';

import { BankAccountType, type IBankAccount } from './type';

export const getBankAccountInitialValues = (editData?: IBankAccount | null) => ({
  bankName: editData?.bankName || '',
  branchName: editData?.branchName || '',
  branchAddress: editData?.branchAddress || '',
  accountHolderName: editData?.accountHolderName || '',
  accountType: editData?.accountType ?? BankAccountType.Saving,
  accountNumber: editData?.accountNumber || '',
  purpose: editData?.purpose || '',
  ifscCode: editData?.ifscCode || '',
  upiId: editData?.upiId || '',
  effectiveFrom: (editData?.effectiveFrom
    ? dayjs(editData.effectiveFrom.slice(0, 10))
    : dayjs().startOf('day')) as Dayjs | null,
  effectiveTo: editData?.effectiveTo ? dayjs(editData.effectiveTo.slice(0, 10)) : null,
  effectiveFromIncomplete: false,
  effectiveToIncomplete: false,
  concurrencyStamp: editData?.concurrencyStamp || '',
});
