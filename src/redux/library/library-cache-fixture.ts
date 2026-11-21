import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import { booksApi } from './bookList/bookList-api';
import { libraryDashboardApi } from './dashboard-api';
import { LibraryChargeApi } from './charges-management/charges-get-api';
import { issueAndReturnApi } from './issueAndReturnApi/issueAndReturnApi';
import { memberManagementApi } from './libraryMembers/memberManagementApi';

export const makeStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
type Store = ReturnType<typeof makeStore>;
type Operation = 'issue' | 'return' | 'status' | 'charge' | 'reservation';
export const paths = {
  detail: '/api/library/books/book-id',
  copies: '/api/library/books/book-id/copies',
  member: '/api/library/members/member-id',
  borrowed: '/api/library/members/member-id/borrowed-books',
  reserved: '/api/library/members/member-id/reserved-books',
  charges: '/api/library/members/member-id/charges',
  history: '/api/library/members/member-id/borrow-history',
  dashboard: '/api/library/dashboard/overview',
};
export const subscriptions = (store: Store) => [
  store.dispatch(booksApi.endpoints.viewBookDetails.initiate({ bookId: 'book-id' })),
  store.dispatch(booksApi.endpoints.getBookCopies.initiate({ bookId: 'book-id' })),
  store.dispatch(
    memberManagementApi.endpoints.getMemberDetails.initiate({ memberId: 'member-id' })
  ),
  store.dispatch(
    memberManagementApi.endpoints.getMemberBorrowedBooks.initiate({ memberId: 'member-id' })
  ),
  store.dispatch(
    memberManagementApi.endpoints.getMemberReservedBooks.initiate({ memberId: 'member-id' })
  ),
  store.dispatch(
    memberManagementApi.endpoints.getMemberCharges.initiate({ memberId: 'member-id' })
  ),
  store.dispatch(
    memberManagementApi.endpoints.getMemberBorrowHistory.initiate({ memberId: 'member-id' })
  ),
  store.dispatch(
    libraryDashboardApi.endpoints.getLibraryDashboardOverview.initiate({
      academicYearId: 'year-id',
    })
  ),
];
export function mutate(store: Store, operation: Operation) {
  if (operation === 'issue')
    return store
      .dispatch(
        issueAndReturnApi.endpoints.issueBook.initiate({
          body: { accessionNo: 'LIB-1', memberId: 'member-id' },
        })
      )
      .unwrap();
  if (operation === 'return')
    return store
      .dispatch(
        issueAndReturnApi.endpoints.returnBook.initiate({
          body: { accessionNo: 'LIB-1', memberId: 'member-id' },
        })
      )
      .unwrap();
  if (operation === 'status')
    return store
      .dispatch(
        booksApi.endpoints.updateBookCopyStatus.initiate({
          bookId: 'book-id',
          accessionNumber: 'LIB-1',
          body: { status: 3 },
        })
      )
      .unwrap();
  if (operation === 'charge')
    return store
      .dispatch(
        LibraryChargeApi.endpoints.addLibraryCharge.initiate({
          body: { memberId: 'member-id', amount: 12.25 },
        })
      )
      .unwrap();
  return store
    .dispatch(
      booksApi.endpoints.reserveBook.initiate({
        bookId: 'book-id',
        body: { memberId: 'member-id' },
      })
    )
    .unwrap();
}
