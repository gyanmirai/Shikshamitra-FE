import type { LibraryBookStatus } from 'src/enums/library-book-status';
import type { LibraryLoanReadMetadata } from 'src/redux/library/circulation-read-types';

export type LibraryLoanRow = Partial<LibraryLoanReadMetadata> & {
  id: string;
  transactionId: string;
  bookId?: string;
  copyId?: string;
  memberId: string;
  memberName?: string;
  role: string;
  bookTitle?: string;
  accessionNo: string;
  classNo?: string;
  division?: string;
  rollNo?: string;
  grNo?: string;
  contactNo?: string;
  bookCategory?: string;
  requestedDate: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string | null;
  status: LibraryBookStatus;
};
