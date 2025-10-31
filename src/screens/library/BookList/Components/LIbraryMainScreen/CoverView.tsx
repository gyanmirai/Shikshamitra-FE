import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import Image from 'next/image';
import { useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Card, Grid, MenuList, MenuItem, Typography } from '@mui/material';
import { useLazyGetCopiesByBookIdQuery } from 'src/redux/library/bookList/copies-api';

import noCover from '../../../../../assets/icons/no-cover.png';

interface LibrarySearchProps {
  onView?: (book: IBook) => void;
  onEdit?: (book: IBook) => void;
  onDelete?: (book: IBook) => void;
  onReserveBook?: (book: IBook) => void;
  onViewAllReservationBook?: (book: IBook) => void;
}

const CoverView = ({
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
          onClick={async () => {
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onView?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
          View
        </MenuItem>
        <MenuItem
          onClick={async () => {
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onEdit?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={async () => {
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onDelete?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify
            icon="solar:trash-bin-trash-bold"
            sx={{ height: '16px', width: '16px', color: 'red' }}
          />
          Delete
        </MenuItem>
        <MenuItem
          onClick={async () => {
            const book = row as IBook;
            const copies = await fetchCopies(book.id).unwrap();
            onReserveBook?.({ ...book, copies });
            pop.onClose();
          }}
        >
          <Iconify icon="game-icons:archive-register" sx={{ height: '16px', width: '16px' }} />
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
          <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
          View Reservation
        </MenuItem>
      </MenuList>
    ),
    [fetchCopies, onDelete, onEdit, onReserveBook, onView, onViewAllReservationBook]
  );
  return (
    <Grid container spacing={2}>
      {books?.map((book) => (
        <Grid size={{ xs: 12, sm: 6, md: 2 }} key={book.isbn}>
          <Card
            sx={{
              position: 'relative',
              borderRadius: 2,
              boxShadow: 10,
              textAlign: 'center',
              p: 1,
              overflow: 'hidden',
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: 0.6,
                '& .three-dots': { opacity: 1, visibility: 'visible' },
              },
            }}
          >
            {/* Cover Image */}
            <Box
              sx={{ position: 'relative', cursor: 'pointer' }}
              onClick={async () => {
                const copies = await fetchCopies(book.id).unwrap();
                onView?.({ ...book, copies });
              }}
            >
              <Image
                src={book.bookCoverImages?.[0] || noCover}
                alt={book.title}
                width={250}
                height={250}
                unoptimized
                style={{ boxShadow: 'var(--shadows-10)', borderRadius: '8px' }}
              />

              {/* ThreeDotsActions replaces the individual edit/delete icons */}
              <Box
                className="three-dots"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 23,
                  height: 23,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  bgcolor: 'rgba(255, 255, 255, 0.85)',
                  boxShadow: 1,
                  alignItems: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.56)',
                  },
                }}
              >
                <ThreeDotsActions
                  placement="top-center"
                  actions={(prop) => actions({ ...prop, row: book })}
                  sx={{ ml: 0.4, mt: 0.2 }}
                />
              </Box>
            </Box>

            {/* Book Info */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {book.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {book.author}
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CoverView;
