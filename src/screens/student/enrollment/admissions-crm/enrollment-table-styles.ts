import type { Theme, SxProps } from '@mui/material/styles';

export const enrollmentTableSx = {
  minWidth: 1080,
  '& .MuiTableCell-head': {
    bgcolor: 'background.neutral',
    color: 'text.secondary',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  '& .MuiTableCell-body': {
    py: 1.25,
    verticalAlign: 'middle',
  },
} satisfies SxProps<Theme>;

export const enrollmentActionHeaderSx = {
  position: 'sticky',
  right: 0,
  zIndex: 3,
  width: 104,
  minWidth: 104,
  bgcolor: 'background.neutral',
} satisfies SxProps<Theme>;

export const enrollmentActionCellSx = {
  position: 'sticky',
  right: 0,
  zIndex: 2,
  width: 104,
  minWidth: 104,
  bgcolor: 'background.paper',
} satisfies SxProps<Theme>;
