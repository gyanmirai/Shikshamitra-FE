import { statusState } from './copy-status-test-fixture';

export const moveOptions = {
  state: { ...statusState, status: 0, sectionId: 'section-a', shelfId: 'shelf-a', canMove: true },
  sections: [
    {
      id: 'section-a',
      sectionName: 'Reading room',
      shelfDetails: [{ id: 'shelf-a', shelfName: 'Shelf A' }],
    },
    {
      id: 'section-b',
      sectionName: 'Reference room',
      shelfDetails: [{ id: 'shelf-b', shelfName: 'Shelf B' }],
    },
  ],
};
export const copyIdentity = { bookId: 'book-id', copyId: 'copy-id', accessionNumber: 'SCHOOL/#42' };
