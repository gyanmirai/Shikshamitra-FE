export interface IReceiptBook {
  id?: string;
  name: string; // From "Receipt Book Name"
  prefix: string; // From "Prefix"
  suffix: string; // From "Suffix"
  startingNumber: number | string; // From "Starting Number"
  endingNumber: number | string; // From "Ending Number"
  description?: string; // From "Description"
  isActive?: boolean; // Optional toggle
  action?: string; // Optional action
  mediumId: string;
  boardId: string;
  mediumStageId: string;
  mediumStageName?: string;
  mediumName?: string;
  boardName?: string;
}

export interface IProps {
  data: IReceiptBook | null;
  onSave: (values: IReceiptBook) => void;
  onClose: (e: any, isSubmit: boolean) => void;
  isEdit: boolean;
  allData: IReceiptBook[];
}
