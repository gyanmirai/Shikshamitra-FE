export interface IReceiptBook {
  id: number;
  receiptBookName: string;
  receiptBookCode: string;
  toggle?: boolean;
  action?: string;
}

export interface IProps {
  data: IReceiptBook | null;
  onSave: (values: IReceiptBook) => void;
  onClose: (e: any, isSubmit: boolean) => void;
  isEdit: boolean;
  allData: IReceiptBook[];
}
