import React from 'react';
import { ArrowBack, Autorenew } from '@mui/icons-material';
import { Label, type LabelColor } from 'src/components/label';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status';

interface IBookCopyCardProps {
  accessionNo: string;
  status: LibraryBookStatus;
  issuedTo?: string;
  issuedDate?: string;
  dueDate?: string;
  onChangeStatus?: () => void;
  onIssueBook?: () => void;
  onReturnBook?: () => void;
}

const BookCopyCard: React.FC<IBookCopyCardProps> = ({
  accessionNo,
  status,
  issuedTo,
  issuedDate,
  dueDate,
  onChangeStatus,
  onIssueBook,
  onReturnBook,
}) => (
  <Card
    sx={{
      p: 2,
      borderRadius: 3,
      boxShadow: 2,
      minWidth: 280,
      borderLeft: `4px solid ${LibraryBookStatusColors[status]}`,
    }}
  >
    <Stack spacing={1.5}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={600}>
          {accessionNo}
        </Typography>
        <Label color={LibraryBookStatusColors[status] as LabelColor}>
          {LibraryBookStatus[status]}
        </Label>
      </Stack>

      {/* Body */}
      {status === LibraryBookStatus.Available ? (
        <Box textAlign="center" py={2}>
          <Typography fontSize={60} color="text.secondary">
            📖
          </Typography>
          <Typography color="text.secondary">Not issued</Typography>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2">
            <b>Issued to</b> : {issuedTo || '—'}
          </Typography>
          <Typography variant="body2">
            <b>Issued Date</b> : {issuedDate || '—'}
          </Typography>
          <Typography variant="body2">
            <b>Due Date</b> : {dueDate || '—'}
          </Typography>
        </Box>
      )}

      {/* Footer Buttons */}
      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Button variant="outlined" size="small" onClick={onChangeStatus} startIcon={<Autorenew />}>
          Change Status
        </Button>

        {status === LibraryBookStatus.Available ? (
          <Button variant="contained" size="small" color="success" onClick={onIssueBook}>
            Issue Book
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<ArrowBack />}
            onClick={onReturnBook}
          >
            Return book
          </Button>
        )}
      </Stack>
    </Stack>
  </Card>
);

export default BookCopyCard;
