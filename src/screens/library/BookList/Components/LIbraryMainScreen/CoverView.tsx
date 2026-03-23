import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import Image from 'next/image';
import { useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Card, Grid, MenuList, MenuItem, Typography } from '@mui/material';

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
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onView?.(row);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px', mr: 1 }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            const book = row as IBook;
            onEdit?.(book);
            pop.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px', mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            const book = row as IBook;
            onDelete?.(book);
            pop.onClose();
          }}
        >
          <Iconify
            icon="solar:trash-bin-trash-bold"
            sx={{ height: '16px', width: '16px', mr: 1, color: 'error.main' }}
          />
          <Typography color="error.main" variant="body2">
            Delete
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            const book = row as IBook;
            onReserveBook?.(book);
            pop.onClose();
          }}
        >
          <Iconify
            icon="game-icons:archive-register"
            sx={{ height: '16px', width: '16px', mr: 1 }}
          />
          Reserve Book
        </MenuItem>
        <MenuItem
          onClick={() => {
            const book = row as IBook;
            onViewAllReservationBook?.(book);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px', mr: 1 }} />
          View Reservation
        </MenuItem>
      </MenuList>
    ),
    [onDelete, onEdit, onReserveBook, onView, onViewAllReservationBook]
  );

  return (
    <Grid container spacing={3}>
      {books?.map((book) => (
        <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2, xl: 2 }} key={book.isbn}>
          <Card
            sx={{
              position: 'relative',
              height: '100%',
              p: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease-in-out',
              overflow: 'visible',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) =>
                  theme.customShadows?.z24 || '0 12px 24px -4px rgba(0,0,0,0.12)',
                borderColor: 'transparent',
                '& .book-cover': {
                  transform: 'scale(1.05)',
                },
                '& .action-btn': {
                  opacity: 1,
                  visibility: 'visible',
                },
              },
            }}
          >
            {/* Image Container with Aspect Ratio */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 160, // Limit width for "smaller" look
                mx: 'auto', // Center horizontally
                pt: '145%', // Aspect ratio for book cover
                overflow: 'hidden',
                borderRadius: 2, // Rounded corners all around
                cursor: 'pointer',
                bgcolor: 'grey.100',
                boxShadow: (theme) => theme.customShadows?.z8 || '0 8px 16px rgba(0,0,0,0.1)', // Frame shadow
              }}
              onClick={() => {
                onView?.(book);
              }}
            >
              <Image
                src={
                  book.coverImage ? `${process.env.NEXT_PUBLIC_API_URL}${book.coverImage}` : noCover
                }
                alt={book.title}
                fill
                unoptimized
                className="book-cover"
                sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 20vw"
                style={{
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                }}
              />

              {/* Gradient Overlay deleted - simpler clean look for small images */}
            </Box>

            {/* Action Button - Floating Top Right relative to CARD */}
            <Box
              className="action-btn"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 9,
                opacity: 0,
                visibility: 'hidden',
                transition: 'all 0.2s ease-in-out',
                '@media (hover: none)': {
                  opacity: 1,
                  visibility: 'visible',
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': {
                    bgcolor: 'white',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <ThreeDotsActions
                  placement="bottom-right"
                  actions={(prop) => actions({ ...prop, row: book })}
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Box>
            </Box>

            {/* Content Section */}
            <Box
              sx={{
                mt: 2,
                px: 0.5,
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <Typography
                variant="subtitle2"
                noWrap
                title={book.title}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  mb: 0.5,
                  color: 'text.primary',
                }}
              >
                {book.title}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  lineHeight: 1.2,
                  fontSize: '0.75rem',
                }}
              >
                {book.author || 'Unknown Author'}
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default CoverView;
