import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import Image from 'next/image';
import { useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Divider, MenuList, MenuItem, Typography } from '@mui/material';
import { useLazyGetCopiesByBookIdQuery } from 'src/redux/library/bookList/copies-api';

import noCover from '../../../../../assets/icons/no-cover.png';

export interface LibrarySearchProps {
  onView?: (book: IBook) => void;
  onEdit?: (book: IBook) => void;
  onDelete?: (book: IBook) => void;
  onReserveBook?: (book: IBook) => void;
  onViewAllReservationBook?: (book: IBook) => void;
}

const ListView = ({
  books,
  onView,
  onEdit,
  onDelete,
  onReserveBook,
  onViewAllReservationBook,
}: { books: IBook[] } & LibrarySearchProps) => {
  const [fetchCopies] = useLazyGetCopiesByBookIdQuery();

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={async (e) => {
            e.stopPropagation();
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onReserveBook?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify icon="game-icons:archive-register" sx={{ height: 16, width: 16, mr: 1 }} />
          Reserve Book
        </MenuItem>

        <MenuItem
          onClick={async (e) => {
            e.stopPropagation();
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onViewAllReservationBook?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} sx={{ height: 16, width: 16, mr: 1 }} />
          View Reservations
        </MenuItem>
      </MenuList>
    ),
    [fetchCopies, onReserveBook, onViewAllReservationBook]
  );

  return (
    <Box>
      {books?.map((book, index) => (
        <Box key={book.isbn} sx={{ mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.2,
              px: 1,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' },
              cursor: 'pointer',
            }}
            onClick={async () => {
              const copies = await fetchCopies(book.id).unwrap();
              onView?.({ ...book, copies });
            }}
          >
            {/* Left section - Image + Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 96,
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'grey.200',
                  boxShadow: 10,
                }}
              >
                <Image
                  src={book.bookCoverImages?.[0] || noCover}
                  alt={book.title}
                  width={250}
                  height={250}
                  unoptimized
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {book.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {book.author}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  ISBN: {book.isbn}
                </Typography>
              </Box>
            </Box>

            {/* Right section - Three Dots */}
            <Box onClick={(e) => e.stopPropagation()}>
              <ThreeDotsActions
                placement="right-center"
                showDeleteIcon
                showEditIcon
                showViewIcon
                actions={(prop) => actions({ ...prop, row: book })}
                handleViewClick={async () => {
                  const selectedBook = book as IBook;
                  const copies = await fetchCopies(selectedBook.id).unwrap();
                  onView?.({ ...selectedBook, copies });
                }}
                handleDeleteClick={async () => {
                  const selectedBook = book as IBook;
                  const copies = await fetchCopies(selectedBook.id).unwrap();
                  onDelete?.({ ...selectedBook, copies });
                }}
                handleEditClick={async () => {
                  const selectedBook = book as IBook;
                  const copies = await fetchCopies(selectedBook.id).unwrap();
                  onEdit?.({ ...selectedBook, copies });
                }}
              />
            </Box>
          </Box>

          {/* Divider between list items */}
          {index !== books.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
};

export default ListView;
