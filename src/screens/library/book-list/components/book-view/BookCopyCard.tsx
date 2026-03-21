import type {
  IBookCopy,
  IBookCopyWithBook,
} from 'src/screens/library/book-management/components/type';

import React, { useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Label, type LabelColor } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, Card, Stack, Tooltip, MenuList, MenuItem, Typography } from '@mui/material';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status';

interface IBookCopyCardProps {
  copy: IBookCopy;
  onChangeStatus?: (copy: IBookCopyWithBook) => void;
  onIssueBook?: (copy: IBookCopyWithBook) => void;
  onReturnBook?: (copy: IBookCopyWithBook) => void;
  onBookHistory?: (copy: IBookCopyWithBook) => void;
}

const BookCopyCard: React.FC<IBookCopyCardProps> = ({
  copy,
  onChangeStatus,
  onIssueBook,
  onReturnBook,
  onBookHistory,
}) => {
  const theme = useTheme();

  // Actions for the three-dot menu
  const actions = useCallback(
    ({ popover: pop }: any) => (
      <MenuList>
        {copy.status === LibraryBookStatus.Available && (
          <MenuItem
            onClick={() => {
              onIssueBook?.(copy as IBookCopyWithBook);
              pop.onClose();
            }}
          >
            <Iconify icon="octicon:issue-closed-16" width={18} height={18} />
            Issue
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onChangeStatus?.(copy as IBookCopyWithBook);
            pop.onClose();
          }}
        >
          <Iconify icon="mdi:swap-horizontal" />
          Change Status
        </MenuItem>
        {copy.status !== LibraryBookStatus.Available && (
          <MenuItem
            onClick={() => {
              onReturnBook?.(copy as IBookCopyWithBook);
              pop.onClose();
            }}
          >
            <Iconify icon="mdi:arrow-u-left-top" />
            Return
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            onBookHistory?.(copy as IBookCopyWithBook);
            pop.onClose();
          }}
        >
          <Iconify icon="material-symbols:history" width={18} height={18} />
          History
        </MenuItem>
      </MenuList>
    ),
    [copy, onChangeStatus, onReturnBook, onIssueBook, onBookHistory]
  );

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 1,
        boxShadow: 2,
        minWidth: 280,
        height: '100%',
        borderLeft: `3px solid ${
          LibraryBookStatusColors[copy.status] === 'default'
            ? theme.palette.grey[500]
            : theme.palette[
                LibraryBookStatusColors[copy.status] as 'success' | 'info' | 'warning' | 'error'
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
          <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" mt={1}>
            <Label color={LibraryBookStatusColors[copy.status] as LabelColor}>
              {LibraryBookStatus[copy.status]}
            </Label>
            <ThreeDotsActions placement="right-center" actions={actions} />
          </Stack>
        </Stack>
        <hr style={{ border: 'none', borderTop: '1px solid #e0e0e0', margin: '1px' }} />
        {/* Body */}
        {copy.status === LibraryBookStatus.Available || !copy.memberId ? (
          <Box textAlign="center" py={2}>
            <Iconify icon="noto:open-book" width={25} color="text.secondary" />
            <Typography color="text.secondary">Not issued</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              borderRadius: 1,
              px: 1.5,
              py: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Stack direction="row" spacing={2}>
              {/* Issued to */}
              <Tooltip
                title={`Issued To: ${copy.memberName || 'Not Available'}`}
                arrow
                placement="top"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flex={1}
                  sx={{ minWidth: 0 }}
                >
                  <Iconify icon="mdi:account" width={16} sx={{ flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {copy.memberName || '—'}
                  </Typography>
                </Stack>
              </Tooltip>
              {/* Section */}
              <Tooltip
                title={`Section: ${(copy.section as any)?.name || copy.section || 'N/A'} / Shelf: ${(copy.shelf as any)?.name || copy.shelf || 'N/A'}`}
                arrow
                placement="top"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flex={1}
                  sx={{ minWidth: 0 }}
                >
                  <Iconify icon="uit:web-section" width={16} sx={{ flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {(copy.section as any)?.name || copy.section || '—'} /{' '}
                    {(copy.shelf as any)?.name || copy.shelf || '—'}
                  </Typography>
                </Stack>
              </Tooltip>
            </Stack>
            <Stack direction="row" spacing={2}>
              {/* Issued date */}
              <Tooltip
                title={`Issue Date: ${copy.issueDate || 'Not Available'}`}
                arrow
                placement="bottom"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flex={1}
                  sx={{ minWidth: 0 }}
                >
                  <Iconify icon="octicon:issue-closed-16" width={16} sx={{ flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {copy.issueDate || '—'}
                  </Typography>
                </Stack>
              </Tooltip>
              {/* Due date */}
              <Tooltip
                title={`Due Date: ${copy.dueDate || 'Not Available'}`}
                arrow
                placement="bottom"
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flex={1}
                  sx={{ minWidth: 0 }}
                >
                  <Iconify icon="fluent-mdl2:date-time" width={16} sx={{ flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{
                      ml: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                    }}
                  >
                    {copy.dueDate || '—'}
                  </Typography>
                </Stack>
              </Tooltip>
            </Stack>
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default BookCopyCard;
