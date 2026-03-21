import React, { useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Card, Stack, MenuList, MenuItem, Typography, CardContent } from '@mui/material';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  barcode: string;
  score: number;
}

interface BookCardProps {
  book: Book;
  onView?: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

const getScoreColor = (score: number) => {
  if (score <= 3) return 'warning.main';
  if (score <= 6) return 'info.main';
  return 'success.main';
};

const BookCard: React.FC<BookCardProps> = ({ book, onView, onEdit, onDelete }) => {
  const actions = useCallback(
    ({ popover: pop, item }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onView?.(item);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.eye} sx={{ height: '16px', width: '16px' }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit?.(item);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete?.(book);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.delete} sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>
      </MenuList>
    ),
    [onView, onEdit, onDelete, book]
  );
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        position: 'relative',
        '&:hover': { boxShadow: 3 },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {book.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {book.author} | ISBN: {book.isbn} | Barcode: {book.barcode}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: getScoreColor(book.score),
              fontWeight: 600,
              mt: 1,
              textAlign: 'right',
            }}
          >
            {book.score.toString().padStart(2, '0')}/10
          </Typography>

          {/* 3 Dots Menu */}
          <ThreeDotsActions
            placement="right-top"
            actions={(prop) => actions({ ...prop, book })}
            showThreeDots
          />
        </Stack>

        {/* Score */}
      </CardContent>
    </Card>
  );
};

export default BookCard;
