import type { IBook } from 'src/screens/library/book-management/components/type';

import dayjs from 'dayjs';
import Image from 'next/image';
import { useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Card, Grid, Divider, MenuList, MenuItem, Typography } from '@mui/material';

import noCover from '../../../../../assets/icons/no-cover.png';

import type { LibrarySearchProps } from './ListView';

const SummaryView = ({
  books,
  onView,
  onEdit,
  onDelete,
  onReserveBook,
  onViewAllReservationBook,
}: { books: IBook[] } & LibrarySearchProps) => {
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            const book = row as IBook;
            onReserveBook?.(book);
            pop.onClose();
          }}
        >
          <Iconify icon="game-icons:archive-register" sx={{ height: 16, width: 16, mr: 1 }} />
          Reserve Book
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            const book = row as IBook;
            onViewAllReservationBook?.(book);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} sx={{ height: 16, width: 16, mr: 1 }} />
          View Reservation
        </MenuItem>
      </MenuList>
    ),
    [onReserveBook, onViewAllReservationBook]
  );
  return (
    <Box sx={{ p: 1 }}>
      {books.map((book) => (
        <Card
          key={book.isbn}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            p: 2,
            mb: 3,
            borderRadius: 2,
            boxShadow: 'var(--shadows-10)',
            position: 'relative',
            cursor: 'pointer',
          }}
          onClick={async () => {
            try {
              onView?.(book);
            } catch (error) {
              console.error('Failed to fetch copies:', error);
              shikshaMitraToast.error({ message: 'Failed to fetch book copies' });
              onView?.(book);
            }
          }}
        >
          {/* Book Cover */}
          <Box
            sx={{
              width: 120,
              height: 160,
              objectFit: 'cover',
              borderRadius: 1,
              mr: 2,
            }}
          >
            <Image
              src={
                book.coverImage ? `${process.env.NEXT_PUBLIC_API_URL}${book.coverImage}` : noCover
              }
              alt={book.title}
              width={250}
              height={250}
              unoptimized
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                boxShadow: 'var(--shadows-12)',
                borderRadius: '8px',
              }}
            />
          </Box>

          {/* Book Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {book.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {book.author}
            </Typography>

            <Grid container spacing={1}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>{book.numberOfPages} </strong>
                  pages
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {book.publisher}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>ISBN :</strong> {book.isbn}
                </Typography>
                <Typography variant="body2">
                  <strong>Copies :</strong> {book.numberOfCopies}
                </Typography>
              </Grid>
            </Grid>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Added :</strong> {dayjs(book.createdOn).format('DD-MM-YYYY')}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
              Description
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.6,
                maxHeight: 60,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae eros eget
              tellus tristique bibendum.
            </Typography>
          </Box>

          {/* Edit Icon */}
          <ThreeDotsActions
            placement="right-center"
            showDeleteIcon
            showEditIcon
            showViewIcon
            actions={(prop) => actions({ ...prop, row: book })}
            handleViewClick={() => {
              const selectedBook = book as IBook;
              onView?.(selectedBook);
            }}
            handleDeleteClick={() => {
              const selectedBook = book as IBook;
              onDelete?.(selectedBook);
            }}
            handleEditClick={() => {
              const selectedBook = book as IBook;
              onEdit?.(selectedBook);
            }}
          />
        </Card>
      ))}
    </Box>
  );
};

export default SummaryView;
