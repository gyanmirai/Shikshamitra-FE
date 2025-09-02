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
}
