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
  effectiveFrom: editData?.effectiveFrom?.slice(0, 10) || new Date().toISOString().slice(0, 10),
  effectiveTo: editData?.effectiveTo?.slice(0, 10) || '',
  concurrencyStamp: editData?.concurrencyStamp || '',
});
