import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render } from '@testing-library/react';
import { mapBookDto } from 'src/redux/library/library-adapters';
import { booksApi } from 'src/redux/library/bookList/bookList-api';
import { currentBookDetail } from 'src/screens/library/BookManagement/BookFormComponents/catalogue-large-holdings.fixture';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import BookList from './index';

export const deletionBook = () => ({
  ...currentBookDetail(1, false),
  priceText: '125.25',
  canDelete: true,
  deletionBlockedReason: null as string | null,
  copies: currentBookDetail(1, false).copies.map((copy) => ({
    ...copy,
    canRemove: false,
    removalBlockedReason: 'Updating copies is not permitted.',
  })),
});
export const deletionId = deletionBook().id;
export const deletionRow = mapBookDto({
  ...deletionBook(),
  canDelete: undefined,
  deletionBlockedReason: undefined,
  metadataRevision: undefined,
  copiesRevision: undefined,
  copies: undefined,
  numberOfCopies: 1,
});
export const deletionStore = () =>
  catalogueTestStore(['Library.AllBooks.View', 'Library.AllBooks.Delete']);

export function serveDeletionList(state = { exists: true }) {
  mswServer.use(
    http.get('http://library.test/api/library/books', () =>
      HttpResponse.json({
        items: state.exists ? [deletionRow] : [],
        totalCount: state.exists ? 1 : 0,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      })
    )
  );
  return state;
}

export async function warmDeletionDetail(store: ReturnType<typeof deletionStore>) {
  return store
    .dispatch(
      booksApi.endpoints.getBookById.initiate(
        { bookId: deletionId },
        { subscribe: false, forceRefetch: true }
      )
    )
    .unwrap();
}

export const renderDeletionCatalogue = (store = deletionStore()) =>
  render(<BookList showBreadCumb={false} />, { wrapper: catalogueTestWrapper(store) });
