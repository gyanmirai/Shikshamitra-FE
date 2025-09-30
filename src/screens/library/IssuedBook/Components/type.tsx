import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { LibraryBookStatus } from 'src/enums/library-book-status';

// Type for table row
export interface ILibraryBookData {
  memberId: string;
  memberName: string;
  bookCategory: string;
  bookTitle: string;
  edition: string;
  dueDate: string;
  returnDate: string;
  bookCondition: string;
  isFixed: boolean;
  accessionNumber: string;
  fineAmount: number;
  requestedDate: string;
  status: LibraryBookStatus;
}

// ------------------ Component ------------------
export interface IssueBookFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: any;
}

export interface ReturnBookFormProps {
  open: UseBooleanReturn;
  onClose: (values: any, submitted: boolean) => void;
  editData?: any;
  onDelete?: (row: ILibraryBookData) => void;
}

export interface IEdition {
  id: string;
  label: string;
  value: string;
}

export interface ITitle {
  title: any;
  id: string;
  label: string;
  value: string;
  author: string;
  quantity: number;
  editions: IEdition[];
  category: string;
}

export interface IBookCategoryOption {
  categoryName: any;
  id: string;
  label: string;
  value: string;
  titles: ITitle[];
  quantity: number;
}
