import { it, expect, describe } from 'vitest';
import { LibraryBookStatus } from 'src/enums/library-book-status';

import { resizeDraftCopies, buildCopiesPayload } from './book-form-model';
import { getInitialBookData } from '../Components/BookManageInitialValues';

describe('persisted book form identities', () => {
  it('uses saved location IDs and preserves non-contiguous copy numbers and status', () => {
    const values = getInitialBookData({
      id: 'book-id',
      numberOfCopies: 99,
      copies: [
        {
          copyId: 'copy-id',
          copyNo: 9,
          accessionNo: 'LIB-9',
          sectionId: 'section-id',
          section: 'Reference',
          shelfId: 'shelf-id',
          shelf: 'Upper shelf',
          role: '',
          issueDate: '',
          dueDate: '',
          status: LibraryBookStatus.Issued,
        },
      ],
    });
    expect(values.copies[0]).toMatchObject({
      copyId: 'copy-id',
      copyNo: 9,
      accessionNo: 'LIB-9',
      section: 'section-id',
      shelf: 'shelf-id',
      status: LibraryBookStatus.Issued,
    });
    expect(String(values.numberOfCopies)).toBe('1');
  });

  it('keeps money as an exact input string rather than rounding decimals', () => {
    expect(getInitialBookData({ price: 125.25 }).price).toBe('125.25');
  });

  it('adds a new copy after the saved number without reindexing or inventing an accession', () => {
    const initial = getInitialBookData({
      id: 'book-id',
      copies: [
        {
          copyId: 'copy-id',
          copyNo: 9,
          accessionNo: 'LIB-9',
          sectionId: 'section-id',
          shelfId: 'shelf-id',
        },
      ],
    });
    const copies = resizeDraftCopies(initial.copies, 2);
    expect(copies.map((copy) => copy.copyNo)).toEqual([9, 10]);
    expect(copies[1].accessionNo).toBe('');
    expect(buildCopiesPayload({ ...initial, copies })).toMatchObject({
      copies: [
        {
          copyId: 'copy-id',
          copyNumber: 9,
          accessionNumber: 'LIB-9',
          sectionId: 'section-id',
          shelfId: 'shelf-id',
        },
        { copyNumber: 10, accessionNumber: null },
      ],
    });
  });
});
