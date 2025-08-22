import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface InvoiceFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
}

export interface InvoiceData {
  student: string;
  class: string;
  division: string;
  amount: number;
  rollNumber?: number; // optional, since not present in all records
  grNumber?: number; // optional, since not present in all records
  paymentTerm?: string; // optional
  dueDate: string; // could also use Date if you’ll parse it
}

export interface IStudentInvoiceData {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  dueDate: string;
  status: 'Paid' | 'Sent' | 'Pending';
}
