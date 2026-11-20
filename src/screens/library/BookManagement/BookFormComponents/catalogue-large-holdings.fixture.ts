import { renderHook } from '@testing-library/react';
import { mapBookDetailDto } from 'src/redux/library/library-adapters';
import { catalogueDefaults } from 'src/screens/library/settings/catalogue-configuration/catalogue-test-data';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from 'src/screens/library/settings/catalogue-configuration/catalogue-test-fixture';

import { useBookEditor } from './useBookEditor';
import { getInitialBookData } from '../Components/BookManageInitialValues';

import type { BookFormValues } from '../Components/type';

export const largeBookId = '7a1959fa-2e3b-401a-bf57-3c43fcbebbd0';
const sectionId = 'a492b599-e151-49d0-bcbd-e30585e1dd76';
const shelfId = '6470f908-5769-49eb-9829-549d60e9db69';

export function currentBookDetail(copyCount: number, received = true) {
  return {
    id: largeBookId,
    metadataRevision: 'metadata-current',
    copiesRevision: `copies-current-${copyCount}`,
    title: 'School Reading Collection',
    author: 'Asha Patel',
    publisher: 'School Press',
    subject: 'Reading',
    isbn: '',
    edition: 'First',
    category: { id: '391c56cb-e552-47d7-a766-831437a51511', name: 'Reading' },
    applicableAge: '',
    pages: 120,
    price: 125.25,
    coverImage: null,
    language: 0,
    languageCode: 'gu',
    languageLabel: 'Gujarati',
    materialCode: null,
    materialLabel: null,
    addedOn: '2026-11-18T04:30:00Z',
    copies: Array.from({ length: copyCount }, (_, index) => ({
      copyId: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
      copyNumber: index + 1,
      accessionNo: `SCHOOL/${index + 1}`,
      status: 0,
      section: { id: sectionId, name: 'Reading Room' },
      shelf: { id: shelfId, name: 'Shelf A' },
      remarks: null,
      receivingReceiptId: received ? '91a67f0c-597b-4d6f-a9df-92e0bc03ef8a' : null,
      canRemove: !received,
      removalBlockedReason: received ? 'Retained by a receiving record.' : null,
    })),
  };
}

export const currentBookValues = (copyCount: number, received = true) =>
  getInitialBookData(mapBookDetailDto(currentBookDetail(copyCount, received)));

export function currentBookMutationResult(copyCount: number, received = true) {
  const book = currentBookDetail(copyCount, received);
  return {
    id: book.id,
    message: 'Book saved.',
    metadataRevision: book.metadataRevision,
    copiesRevision: book.copiesRevision,
  };
}

export function renderExistingBookEditor(initial: BookFormValues) {
  const creating = !initial.id;
  const store = catalogueTestStore([
    'Library.AllBooks.View',
    creating ? 'Library.AllBooks.Add' : 'Library.AllBooks.Update',
  ]);
  return renderHook(
    () =>
      useBookEditor(initial, 'year-id', creating, !creating, () => undefined, catalogueDefaults),
    {
      wrapper: catalogueTestWrapper(store),
    }
  );
}
