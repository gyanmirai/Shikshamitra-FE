import React, { useCallback } from 'react';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, MenuList, MenuItem, Typography } from '@mui/material';
import { useLazyGetCopiesByBookIdQuery } from 'src/redux/library/bookList/copies-api';

import type { IBook } from '../../BookManagement/Components/type';

interface Props {
  groupedBooks: Record<string, IBook[]>;
  onView?: (book: IBook) => void;
  onEdit?: (book: IBook) => void;
  onDelete?: (book: IBook) => void;
  onReserveBook?: (book: IBook) => void;
  onViewAllReservationBook?: (book: IBook) => void;
}

const GroupedBookList: React.FC<Props> = ({
  groupedBooks,
  onView,
  onEdit,
  onDelete,
  onReserveBook,
  onViewAllReservationBook,
}) => {
  const [fetchCopies] = useLazyGetCopiesByBookIdQuery();
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={async () => {
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onReserveBook?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:book-arrow-right" sx={{ height: '16px', width: '16px' }} />
          Reserve Book
        </MenuItem>
        <MenuItem
          onClick={async () => {
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onViewAllReservationBook?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:book-arrow-right" sx={{ height: '16px', width: '16px' }} />
          View All Reservation Book
        </MenuItem>
      </MenuList>
    ),
    [fetchCopies, onReserveBook, onViewAllReservationBook]
  );
  return (
    <>
      {Object.keys(groupedBooks).map((letter) => (
        <Box key={letter}>
          <CustomizableTable
            tableId="grouped-books-table"
            noDataText="No Books Data Found"
            columns={[
              { id: 'title', label: 'Title', align: 'left', sticky: true },
              { id: 'category', label: 'Category', align: 'left' },
              {
                id: 'totalBook',
                label: 'Total Copies',
                align: 'left',
                filterType: 'number',
                render: (value, row) => (
                  <Typography variant="caption" fontSize="13px" color="text.primary">
                    {row.availableBook}/{row.totalBook}
                  </Typography>
                ),
              },
              { id: 'author', label: 'Author', align: 'left' },
              { id: 'isbn', label: 'ISBN', align: 'left' },
              { id: 'reservedBook', label: 'Reserved Copies', align: 'left', filterType: 'number' },
              { id: 'publisher', label: 'Publisher', align: 'left' },
              {
                id: 'action',
                label: 'Actions',
                minWidth: 60,
                align: 'center',
                isSort: false,
                isFilter: false,
                sticky: true,
                render(_, row) {
                  return (
                    <ThreeDotsActions
                      placement="right-top"
                      showDeleteIcon
                      showEditIcon
                      actions={(prop) => actions({ ...prop, row })}
                      showViewIcon
                      handleViewClick={async () => {
                        const book = row as IBook;
                        const copies = await fetchCopies(book.id).unwrap();
                        onView?.({ ...book, copies });
                      }}
                      handleDeleteClick={async () => {
                        const book = row as IBook;
                        const copies = await fetchCopies(book.id).unwrap();
                        onDelete?.({ ...book, copies });
                      }}
                      handleEditClick={async () => {
                        const book = row as IBook;
                        const copies = await fetchCopies(book.id).unwrap();
                        onEdit?.({ ...book, copies });
                      }}
                    />
                  );
                },
              },
            ]}
            data={groupedBooks[letter] || []}
          />
        </Box>
      ))}
    </>
  );
};

export default GroupedBookList;
