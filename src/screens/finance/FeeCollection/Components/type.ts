import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IFeeData {
  id: string | number;
  name: string;
  board: string;
  medium: string;
  className: string;
  division: string;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface IFeeTableProps {
  data: IFeeData[];
  onAddFee: UseBooleanReturn;
  setOpenDialog: (open: boolean) => void;
  setEditData: (data: IFeeData | null) => void;
  onDelete: (row: IFeeData) => void;
  onEdit: (row: IFeeData) => void;
  onCollectFee: (row: IFeeData) => void;
  onView: (row: IFeeData) => void;
}
// Fee term details (monthly/quarterly/etc.)
export interface IFeeTerm {
  id: string | number;
  termName: string; // e.g. "January 2025"
  dueDate: string; // ISO string
  paidAmount: number;
  totalAmount: number;
  feeHeads: IFeeHead[];
}

// Payment details entered during collection
export interface IPaymentDetails {
  totalPayableAmount: number;
  receivedAmount: number;
  paymentMethod: 'Cash' | 'Cheque' | 'UPI' | 'Card' | string;
  notes?: string;
  paidTerms: IFeeTerm[]; // terms that were paid in this payment
}

// Overall student fee data
export interface IStudentFee {
  id: string | number;
  name: string;
  profileImage?: string; // image URL
  rollNumber: string;
  board: string;
  medium: string;
  className: string;
  division: string;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  overdueFees: number;
  status: string;
  terms: IFeeTerm[];
  paymentDetails?: IPaymentDetails;
  contactNumber?: string;
  admissionDate?: string;
  grNumber?: string;
  parentName?: string;
  email?: string;
}

export interface IFeeHead {
  name: string;
  paid: number;
  total: number;
  status: 'Paid' | 'Pending';
}

export interface ITerm {
  id: string;
  name: string;
  dueDate: string;
  paid: number;
  total: number;
  feeHeads: IFeeHead[];
}

export interface ITermsToCollectProps {
  terms: ITerm[] | null; // Optional terms data
  selectedTerms: string[];
  onTermSelect: (selectedTerms: string[]) => void;
  showError?: boolean;
  errorMessage?: string;
}
export interface IPaymentDetailsFormProps {
  formik: FormikProps<any>; // Formik instance passed from parent
}

export interface IPaymentFieldConfig {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: string[];
}

export type IPaymentMethodsConfig = Record<string, IPaymentFieldConfig[]>;

export interface IPaymentData {
  [method: string]: Record<string, string | number | null>;
}
