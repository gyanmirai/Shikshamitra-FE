import { redirect } from 'next/navigation';

export default function LibraryReservationCirculationRedirect() {
  redirect('/library/book-list');
}
