interface IssuedBook {
  bookId: string;
  title: string;
  issueDate: string;
  dueDate: string;
  issueCount: number;
}

interface ReservedBook {
  bookId: string;
  title: string;
  reservationDate: string;
}

interface Member {
  memberId: string;
  name: string;
  role: 'Student' | 'Teacher';
  memberStatus: 'Active' | 'Inactive';
  class?: string; // Only for students
  borrowLimit: number;
  currentIssue: number;
  pendingReturn: number;
  overdueReturn: number;
  issuedBooks: IssuedBook[];
  reservedBooks: ReservedBook[];
}

interface Edition {
  year: number;
  publisher: string;
  totalCopies: number;
  availableCopies: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  editions: Edition[];
}
