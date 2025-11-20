export interface IBankAccount {
  id: string;
  bankName: string;
  branchName: string;
  branchAddress?: string;
  accountName: string;
  accountType: string; // Savings | Current | Salary | Other
  accountNumber: string;
  accountPurpose?: string;
  ifscCode: string;
  upiId?: string;
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
}

export interface IBankAccountFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IBankAccount | null;
}
