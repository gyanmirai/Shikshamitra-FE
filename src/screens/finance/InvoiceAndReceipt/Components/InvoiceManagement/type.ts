import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface InvoiceFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
}

export interface FeeItem {
  name: string;
  amount: number;
}

export interface ConcessionItem {
  name: string;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  studentId: string;
  student: string;
  class: string;
  division: string;
  rollNumber?: number;
  grNumber?: number;
  academicYear: string;
  billingCycle: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annually';
  billingPeriod: string[] | string;
  feeItems: FeeItem[];
  concessions: ConcessionItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'Pending' | 'Partial' | 'Paid';
  createdAt: string;
  receiptIds: string[];
}

export interface IStudentInvoiceData {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMethod: string;
  billingCycle: string;
  billingPeriod: string[] | string;
  dueDate: string;
  status: 'Pending' | 'Partial' | 'Paid';
}
