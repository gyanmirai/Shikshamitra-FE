import { redirect } from 'next/navigation';

export default function LibraryReservationManagementRedirect() {
  redirect('/library/book-list');
}
