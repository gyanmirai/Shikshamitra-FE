import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IReservedBookData {
  memberId: string; // e.g., "Physics", "India"
  memberName: string; // e.g., "Dharmik Jinjala", "Prerna Atre"
  role: string; // Role of the member
  reservedOn: string; // e.g., "10-08-2025" (date in DD-MM-YYYY)
  bookCategory?: string; // Book category
  bookTitle?: string; // Book title
  edition?: string; // Book edition
}
// ------------------ Component ------------------
export interface IReservationFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: any;
}
