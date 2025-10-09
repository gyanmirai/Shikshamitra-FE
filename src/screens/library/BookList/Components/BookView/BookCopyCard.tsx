import type {
  IBookCopy,
  IBookCopyWithBook,
} from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { ArrowBack, Autorenew } from '@mui/icons-material';
import { Label, type LabelColor } from 'src/components/label';
import { Box, Card, Stack, Button, Typography } from '@mui/material';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status';

interface IBookCopyCardProps {
  copy: IBookCopy;
  onChangeStatus?: (copy: IBookCopyWithBook) => void;
  onIssueBook?: (copy: IBookCopyWithBook) => void;
  onReturnBook?: (copy: IBookCopyWithBook) => void;
}

const BookCopyCard: React.FC<IBookCopyCardProps> = ({
  copy,
  onChangeStatus,
  onIssueBook,
  onReturnBook,
}) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: 2,
        minWidth: 280,
        height: '100%',
        borderLeft: `3px solid ${
          LibraryBookStatusColors[copy.status] === 'default'
            ? theme.palette.grey[500]
            : theme.palette[
                LibraryBookStatusColors[copy.status] as
                  | 'success'
                  | 'info'
                  | 'warning'
                  | 'error'
              ].main
        }`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Content section */}
      <Stack spacing={1.5} flexGrow={1}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={600}>
            {copy.accessionNo}
          </Typography>
          <Label color={LibraryBookStatusColors[copy.status] as LabelColor}>
            {LibraryBookStatus[copy.status]}
          </Label>
        </Stack>

        {/* Body */}
        {copy.status === LibraryBookStatus.Available || !copy.memberId ? (
          <Box textAlign="center" py={2}>
            <Iconify icon="noto:open-book" width={30} color="text.secondary" />
            <Typography color="text.secondary">Not issued</Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2">
              <b>Issued to</b> : {copy.memberName || '—'}
            </Typography>
            <Typography variant="body2">
              <b>Issued Date</b> : {copy.issueDate || '—'}
            </Typography>
            <Typography variant="body2">
              <b>Due Date</b> : {copy.dueDate || '—'}
            </Typography>
          </Box>
        )}
      </Stack>

      {/* Footer Buttons */}
      <Stack direction="row" spacing={1} justifyContent="space-between">
        <Button
          variant="outlined"
          size="small"
          onClick={() => onChangeStatus?.(copy as IBookCopyWithBook)}
          startIcon={<Autorenew />}
        >
          Change Status
        </Button>

        {copy.status === LibraryBookStatus.Available ? (
          <Button
            variant="contained"
            size="small"
            color="success"
            onClick={() => onIssueBook?.(copy as IBookCopyWithBook)}
            startIcon={<Iconify icon="cib:stackoverflow" />}
          >
            Issue Book
          </Button>
        ) : (
          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<ArrowBack />}
            onClick={() => onReturnBook?.(copy as IBookCopyWithBook)}
          >
            Return book
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default BookCopyCard;
