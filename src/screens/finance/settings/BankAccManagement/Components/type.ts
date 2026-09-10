export enum BankAccountType {
  Saving = 0,
  Current = 1,
}

export interface IBankAccount {
  id: string;
  code?: string;
  accountHeadId?: string;
  accountHeadName?: string;
  bankName: string;
  branchName: string;
  branchAddress?: string;
  accountHolderName: string;
  accountType: BankAccountType;
  accountNumber?: string;
  maskedAccountNumber: string;
  purpose?: string;
  ifscCode: string;
  upiId?: string;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  concurrencyStamp: string;
  version: number;
  canDelete: boolean;
  isUsedInDownstream: boolean;
  isActive: boolean;
  deactivationReason?: string | null;
}

export interface IBankAccountTableProps {
  data: IBankAccount[];
  onAddBankAccount: any;
  editData: IBankAccount | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IBankAccount | null) => void;
  onDelete: (data: IBankAccount) => void;
  onEdit: (data: IBankAccount) => void;
  isLoading?: boolean;
  totalCount?: number;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
}

export interface IBankAccountFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IBankAccount | null;
}
