import { renderHook } from '@testing-library/react';
import { booksApi } from 'src/redux/library/bookList/bookList-api';
import { catalogueDefaults } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { useBookEditor } from './useBookEditor';
import { getInitialBookData } from '../Components/BookManageInitialValues';
import { largeBookId, currentBookDetail } from './catalogue-large-holdings.fixture';

export const revisionBookId = largeBookId;
export const revisionGrants = ['Library.AllBooks.View', 'Library.AllBooks.Update'];
export const revisionStore = () => catalogueTestStore(revisionGrants);
export const revisionBook = () => ({
  ...currentBookDetail(2, false),
  priceText: '125.25',
  metadataRevision: 'metadata-1',
  copiesRevision: 'copies-1',
});
export type RevisionBook = ReturnType<typeof revisionBook>;
export const unreviewedCopies = (book: RevisionBook): RevisionBook => ({
  ...book,
  copiesRevision: 'copies-new-unreviewed',
  copies: [
    ...book.copies,
    {
      ...book.copies[0],
      copyId: '00000000-0000-0000-0000-000000000003',
      copyNumber: 3,
      accessionNo: 'SCHOOL/UNREVIEWED-3',
    },
  ],
});
export const revisionResult = (book: RevisionBook) => ({
  id: book.id,
  message: 'Book saved.',
  metadataRevision: book.metadataRevision,
  copiesRevision: book.copiesRevision,
});

export async function readRevisionBook(store = revisionStore()) {
  const source = await store
    .dispatch(
      booksApi.endpoints.getBookById.initiate(
        { bookId: revisionBookId },
        { subscribe: false, forceRefetch: true }
      )
    )
    .unwrap();
  return { source, store };
}

export async function openRevisionEditor() {
  const { source, store } = await readRevisionBook();
  const initial = getInitialBookData(source);
  const editor = renderHook(
    () => useBookEditor(initial, 'year-id', false, true, () => undefined, catalogueDefaults),
    { wrapper: catalogueTestWrapper(store) }
  );
  return { ...editor, store, source };
}

export function revisionEditorOptions(book: RevisionBook) {
  const copy = book.copies[0];
  return {
    bookCategories: [book.category],
    sections: [
      {
        id: copy.section.id,
        sectionName: copy.section.name,
        shelfDetails: [{ id: copy.shelf.id, shelfName: copy.shelf.name }],
      },
    ],
    catalogueConfiguration: catalogueDefaults,
  };
}
