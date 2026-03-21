import type { FormikProps } from 'formik';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';
import type { FeeCollectionStatusType } from 'src/enums/fee-collection-type';

export interface IFeeData {
  id: string | number;
  name: string;
  board: string;
  medium: string;
  className: string;
  division: string;
  paybleFees?: number;
  charges?: number;
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface IFeeTableProps {
  onAddFee: UseBooleanReturn;
  selectedBoard: string;
  setSelectedBoard: (value: string) => void;
  selectedMedium: string;
  setSelectedMedium: (value: string) => void;
  onDelete: (row: IFeeData) => void;
  onCollectFee: (row: IFeeData) => void;
  onView: (row: IFeeData) => void;
}
// Fee term details (monthly/quarterly/etc.)
export interface IFeeTerm {
  id: string | number;
  termName: string; // e.g. "January 2025"
  name?: string; // alias for termName used in some components
  dueDate: string; // ISO string
  paidAmount: number;
  paid?: number; // alias for paidAmount
  totalAmount: number;
  total?: number; // alias for totalAmount
  feeHeads: IFeeHead[];
  charges?: IFeeCharge[];
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
  chargesPaid?: number;
  chargesTotal?: number;
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
  feeHeadId: string;
  feeHeadName: string;
  name?: string; // alias for feeHeadName
  totalAmount: number;
  total?: number; // alias for totalAmount
  paidAmount: number;
  paid?: number; // alias for paidAmount
  pendingAmount: number;
  status: FeeCollectionStatusType;
}

export interface IFeeCharge {
  chargeId: string;
  id?: string | number; // alias for chargeId or index
  chargeName: string;
  amount: number;
  total?: number;
  dueDate?: string;
  paid?: number;
  status?: number | string;
}

export interface IPaymentEntry {
  paymentMethod: string;
  amount: string | number;
  details: Record<string, any>;
}

export interface IPaymentFormValues {
  payments: IPaymentEntry[];
  selectedFeeHeads: { feeHeadId: string; amount: number }[];
  selectedCharges: { chargeId: string; amount: number }[];
  totalAmount: string | number; // This is the total from payment methods
  totalPayableAmount: number; // This is the sum of selected fees/charges
  receivedAmount: string | number;
  notes: string;
  includeCharges?: boolean;
  [key: string]: any; // For dynamic payment method fields
}

export interface ITermsToCollectProps {
  formik: FormikProps<IPaymentFormValues>;
  feeHeads: IFeeHead[];
  charges: IFeeCharge[];
  showError?: boolean;
  errorMessage?: string;
}

export interface ITermsToCollectDetailedProps {
  terms: IFeeTerm[];
  selectedTerms: (string | number)[];
  onTermSelect: (selected: (string | number)[]) => void;
  showError?: boolean;
  errorMessage?: string;
}
export interface IPaymentDetailsFormProps {
  formik: FormikProps<IPaymentFormValues>;
  feeHeads?: IFeeHead[];
  charges?: IFeeCharge[];
}

export interface IPaymentFieldConfig {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  options?: string[];
}

export type IPaymentMethodsConfig = Record<string, IPaymentFieldConfig[]>;

export interface IPaymentData {
  [method: string]: Record<string, string | number | null>;
}
