export interface IBookTableProps {
  data: any[];
  onView?: (data: any) => void;
  onEdit?: (data: any) => void;
  onDelete?: (data: any) => void;
}

export interface IBookCopy {
  copyNo: number;
  accessionNo: string;
  rfidEnabled: boolean;
  rfidId: string | null;
  vendor: string;
}

export interface IBookPayload {
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  createdOn?: string;
  subject: string;
  category: string;
  edition: string;
  language: string;
  numberOfCopies: number;
  bookCoverImages: string[]; // URLs or file references
  copies: IBookCopy[];
  documents?: File[];
}

export interface IBookFormProps {
  open: boolean;
  onClose: (event: any, success?: boolean) => void;
  editData?: IBookPayload | null;
}
