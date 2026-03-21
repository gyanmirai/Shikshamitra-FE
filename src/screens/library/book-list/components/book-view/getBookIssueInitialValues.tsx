import type { IBookCopyWithBook } from 'src/screens/library/book-management/components/type';

import dayjs from 'dayjs';
import { LibraryBookStatus } from 'src/enums/library-book-status';

export const getInitialValues = (editData: IBookCopyWithBook | null) => ({
  bookId: editData?.bookId || '',
  role: editData?.role || '',
  className: editData?.className || '',
  division: editData?.division || '',
  memberId: editData?.memberId || '',
  memberName: editData?.memberName || '',
  issueDate: editData?.issueDate ? dayjs(editData.issueDate) : dayjs(),
  accessionNumber: editData?.accessionNo || '',
  dueDate: editData?.dueDate ? dayjs(editData.dueDate) : null,
  status: editData?.status || LibraryBookStatus.Issued,
});
