export interface IReceiptBook {
  id: number;
  receiptBookName: string; // From "Receipt Book Name"
  prefix: string; // From "Prefix"
  suffix: string; // From "Suffix"
  startingNumber: number | string; // From "Starting Number"
  endingNumber: number | string; // From "Ending Number"
  description?: string; // From "Description"
  toggle?: boolean; // Optional toggle
  action?: string; // Optional action
  medium: string;
  board: string;
  organization: string;
}

export interface IProps {
  data: IReceiptBook | null;
  onSave: (values: IReceiptBook) => void;
  onClose: (e: any, isSubmit: boolean) => void;
  isEdit: boolean;
  allData: IReceiptBook[];
}
