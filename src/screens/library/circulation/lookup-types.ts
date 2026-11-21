export type LoanLookupBook = {
  id?: string;
  bookId?: string;
  title?: string;
  bookTitle?: string;
  accessionNo: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  edition?: string;
  addedOn?: string;
  language?: string | number;
  category?: string;
  pages?: number;
  coverImage?: string | null;
};
export type ChargeOption = { id: string; name: string; amount: string | number; isFixed: boolean };
