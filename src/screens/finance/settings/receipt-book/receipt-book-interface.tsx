export interface IReceiptBook {
  id: number;
  receiptBookName: string;
  receiptBookCode: string;
  toggle?: boolean;
  action?: string;
}

export interface IProps {
  data: IReceiptBook;
  onSave: (values: IReceiptBook) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: IReceiptBook[];
}
