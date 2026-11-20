import { useFormik } from 'formik';
import { it, vi, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LibraryBookStatus } from 'src/enums/library-book-status';

import { BookCopiesTable } from './BookCopiesTable';
import { getInitialBookData } from '../Components/BookManageInitialValues';

const auth = vi.hoisted(() => ({
  permissionsInitialized: true,
  loading: false,
  permissions: ['Library.AllBooks.View', 'Library.AllBooks.Update', 'Library.Receiving.View'].map(
    (name) => ({ name, isGranted: true })
  ),
}));
beforeEach(() => {
  auth.permissions = [
    'Library.AllBooks.View',
    'Library.AllBooks.Update',
    'Library.Receiving.View',
  ].map((name) => ({ name, isGranted: true }));
});
vi.mock('react-redux', () => ({ useSelector: (select: any) => select({ auth }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.id}>
          {columns.map((column: any) => (
            <div key={column.id}>
              {column.render ? column.render(row[column.id], row) : row[column.id]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

function Harness({
  metadata = {},
  persisted = true,
}: {
  metadata?: Record<string, unknown>;
  persisted?: boolean;
}) {
  const formik = useFormik({
    initialValues: getInitialBookData({
      copies: [
        {
          ...metadata,
          copyId: persisted ? 'saved-copy' : undefined,
          copyNo: 7,
          accessionNo: 'SCHOOL/7',
          status: LibraryBookStatus.Available,
          section: 'section-id',
          shelf: 'shelf-id',
        },
      ],
    }),
    onSubmit: () => undefined,
  });
  return <BookCopiesTable formik={formik} sections={[]} disabled={false} onRemove={vi.fn()} />;
}

it.each([
  {
    canRemove: false,
    receivingReceiptId: 'receipt-id',
    removalBlockedReason: 'Retained by a receiving record.',
  },
  {
    canRemove: false,
    receivingReceiptId: null,
    removalBlockedReason: 'This copy has circulation history.',
  },
  {},
])(
  'blocks removal of an Available persisted copy without an explicit safe capability',
  (metadata) => {
    render(<Harness metadata={metadata} />);
    expect(screen.getByRole('button', { name: 'Remove copy 7' })).toBeDisabled();
  }
);

it('retains removal for a persisted ordinary copy explicitly authorized by the server', () => {
  render(<Harness metadata={{ canRemove: true, receivingReceiptId: null }} />);
  expect(screen.getByRole('button', { name: 'Remove copy 7' })).toBeEnabled();
});

it('retains local removal of an unsaved draft without server provenance', () => {
  render(<Harness persisted={false} />);
  expect(screen.getByRole('button', { name: 'Remove copy 7' })).toBeEnabled();
});

it('links recorded receiving provenance only under exact receiving and catalogue read authority', () => {
  auth.permissions = [
    'Library.AllBooks.View',
    'Library.AllBooks.Update',
    'Library.Receiving.View',
  ].map((name) => ({ name, isGranted: true }));
  render(<Harness metadata={{ receivingReceiptId: 'receipt-id', canRemove: false }} />);
  expect(screen.getByRole('link', { name: /View receiving receipt/ })).toHaveAttribute(
    'href',
    '/library/receiving/receipt-id'
  );
});

it('keeps receiving detail inaccessible from a catalogue-only row', () => {
  auth.permissions = ['Library.AllBooks.View', 'Library.AllBooks.Update'].map((name) => ({
    name,
    isGranted: true,
  }));
  render(<Harness metadata={{ receivingReceiptId: 'receipt-id', canRemove: false }} />);
  expect(screen.queryByRole('link', { name: /View receiving receipt/ })).not.toBeInTheDocument();
});
