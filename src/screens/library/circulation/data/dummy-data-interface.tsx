export interface IMemberCirculation {
  id: string;
  name: string;
  role: 'Student' | 'Teacher';
}

export interface IIssuer {
  userId: string;
  name: string;
  role: 'Student' | 'Teacher';
  issueDate: string;
  dueDate: string;
}

export interface IReservation {
  userId: string;
  name: string;
  role: 'Student' | 'Teacher';
  reservationDate: string;
}

export interface IBookEditionWithDetails {
  year: number;
  totalCopies: number;
  availableCopies: number;
  currentIssuers: IIssuer[];
  reservedList: IReservation[];
}

export interface IBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  editions: IBookEditionWithDetails[];
}

export interface IBookEditionSummary {
  year: number;
  publisher: string;
  totalCopies: number;
  availableCopies: number;
}

export interface IBookSummary {
  id: string;
  title: string;
  author: string;
  publisher: string;
  editions: IBookEditionSummary[];
}

export interface IFine {
  bookId: string;
  title: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'Overdue' | 'Pending' | 'Paid';
  fineAmount: number;
  receivedAmount: number;
  fineReason: string;
}

export interface IFineCirculation {
  memberId: string;
  memberName: string;
  totalFineAmount: number;
  status: string;
  role: string;
  fines: IFine[];
}

export interface IReservationData {
  bookId: string;
  title: string;
  memberName: string;
  requestedDate: string;
  status: string;
}
