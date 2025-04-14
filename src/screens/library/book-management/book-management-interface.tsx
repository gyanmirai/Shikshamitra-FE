export interface IAddNewBookDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
}

export interface IReturnBookDialogProps {
  dialogValue: boolean;
  onSave: (values: any) => void;
  onClose: () => void;
  data?: any; // Data for selected book and member
  bookData: any[]; // List of books
  memberData: any[]; // List of members
}
