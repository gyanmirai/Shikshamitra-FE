import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface InvoiceFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
}
