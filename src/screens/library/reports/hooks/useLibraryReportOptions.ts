import { useMemo } from 'react';

// Mock data - Replace with actual Redux API calls when available
const MOCK_BOOKS = [
  'The Great Gatsby',
  'To Kill a Mockingbird',
  '1984',
  'Pride and Prejudice',
  'The Catcher in the Rye',
];

const MOCK_CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Mathematics',
  'History',
  'Literature',
  'Technology',
  'Arts',
];

const MOCK_AUTHORS = [
  'J.K. Rowling',
  'George Orwell',
  'Jane Austen',
  'Mark Twain',
  'Charles Dickens',
];

const MOCK_PUBLISHERS = [
  'Penguin Books',
  'HarperCollins',
  'Simon & Schuster',
  'Macmillan',
  'Oxford University Press',
];

const MOCK_MEMBERS = ['Student 1', 'Student 2', 'Staff 1', 'Staff 2'];

const MOCK_VENDORS = ['Vendor A', 'Vendor B', 'Vendor C', 'Vendor D'];

const MOCK_DEPARTMENTS = ['Science', 'Mathematics', 'English', 'Social Studies', 'Administration'];

const MOCK_CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
];

const MOCK_SECTIONS = ['A', 'B', 'C', 'D'];

const MOCK_SHELVES = ['Shelf A1', 'Shelf A2', 'Shelf B1', 'Shelf B2', 'Shelf C1', 'Shelf C2'];

export const BOOK_STATUS_OPTIONS = ['Available', 'Issued', 'Reserved', 'Lost', 'Damaged'];

export const MEMBER_STATUS_OPTIONS = ['Active', 'Inactive', 'Blocked', 'Expired'];

export const ISSUE_STATUS_OPTIONS = ['Issued', 'Returned', 'Overdue', 'Lost'];

export const RESERVATION_STATUS_OPTIONS = ['Pending', 'Fulfilled', 'Cancelled', 'Expired'];

export const FINE_REASON_OPTIONS = ['Overdue', 'Lost Book', 'Damaged Book', 'Late Return'];

export const DAMAGE_TYPE_OPTIONS = [
  'Minor Damage',
  'Major Damage',
  'Lost',
  'Water Damage',
  'Torn Pages',
];

export const MEMBER_TYPE_OPTIONS = ['Student', 'Staff', 'Guest'];

export const BLOCK_REASON_OPTIONS = [
  'Unpaid Fines',
  'Lost Books',
  'Damaged Books',
  'Misconduct',
  'Other',
];

export const REPORT_PERIOD_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export const ACTION_TYPE_OPTIONS = [
  'Book Issue',
  'Book Return',
  'Book Add',
  'Book Update',
  'Member Add',
  'Member Update',
  'Fine Collection',
  'Reservation',
];

export const useLibraryReportOptions = () => {
  // TODO: Replace with actual Redux API calls
  // const { data: bookData } = useGetBooksQuery({});
  // const { data: categoryData } = useGetCategoriesQuery({});
  // const { data: authorData } = useGetAuthorsQuery({});
  // const { data: publisherData } = useGetPublishersQuery({});
  // const { data: memberData } = useGetMembersQuery({});
  // const { data: vendorData } = useGetVendorsQuery({});

  const bookOptions = useMemo(() => MOCK_BOOKS, []);
  const categoryOptions = useMemo(() => MOCK_CATEGORIES, []);
  const authorOptions = useMemo(() => MOCK_AUTHORS, []);
  const publisherOptions = useMemo(() => MOCK_PUBLISHERS, []);
  const memberOptions = useMemo(() => MOCK_MEMBERS, []);
  const vendorOptions = useMemo(() => MOCK_VENDORS, []);
  const departmentOptions = useMemo(() => MOCK_DEPARTMENTS, []);
  const classOptions = useMemo(() => MOCK_CLASSES, []);
  const sectionOptions = useMemo(() => MOCK_SECTIONS, []);
  const shelfOptions = useMemo(() => MOCK_SHELVES, []);

  return {
    bookOptions,
    categoryOptions,
    authorOptions,
    publisherOptions,
    memberOptions,
    vendorOptions,
    departmentOptions,
    classOptions,
    sectionOptions,
    shelfOptions,
    bookStatusOptions: BOOK_STATUS_OPTIONS,
    memberStatusOptions: MEMBER_STATUS_OPTIONS,
    issueStatusOptions: ISSUE_STATUS_OPTIONS,
    reservationStatusOptions: RESERVATION_STATUS_OPTIONS,
    fineReasonOptions: FINE_REASON_OPTIONS,
    damageTypeOptions: DAMAGE_TYPE_OPTIONS,
    memberTypeOptions: MEMBER_TYPE_OPTIONS,
    blockReasonOptions: BLOCK_REASON_OPTIONS,
    reportPeriodOptions: REPORT_PERIOD_OPTIONS,
    actionTypeOptions: ACTION_TYPE_OPTIONS,
  };
};
