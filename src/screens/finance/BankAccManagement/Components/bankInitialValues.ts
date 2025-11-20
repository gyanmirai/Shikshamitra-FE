import type { IBankAccount } from './type';

export const getBankAccountInitialValues = (editData?: IBankAccount | null) => ({
  bankName: editData?.bankName || '',
  branchName: editData?.branchName || '',
  branchAddress: editData?.branchAddress || '',
  accountName: editData?.accountName || '',
  accountType: editData?.accountType || '',
  accountNumber: editData?.accountNumber || '',
  accountPurpose: editData?.accountPurpose || '',
  ifscCode: editData?.ifscCode || '',
  upiId: editData?.upiId || '',
});
