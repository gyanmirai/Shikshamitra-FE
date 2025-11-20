import type { JSX } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { GlobalIcons } from 'src/utils/icons';
// import { useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Box, Typography, DialogTitle } from '@mui/material';
import { Info, Error, CheckCircle, WarningAmber } from '@mui/icons-material';

import { Iconify } from '../iconify';

import type { ConfirmDialogProps } from './types';

type ConfirmIconType = 'info' | 'warning' | 'success' | 'error';
// ----------------------------------------------------------------------
const iconMap: Record<ConfirmIconType, JSX.Element> = {
  warning: <WarningAmber color="warning" fontSize="medium" />,
  success: <CheckCircle color="success" fontSize="medium" />,
  info: <Info color="info" fontSize="medium" />,
  error: <Error color="error" fontSize="medium" />,
};
export function ConfirmDialog({
  title,
  content,
  action,
  open,
  onClose,
  icon = 'error',
  ...other
}: ConfirmDialogProps) {
  // const theme = useTheme();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          {iconMap[icon as ConfirmIconType]}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      {content && (
        <DialogContent sx={{ typography: 'body2', padding: '0 16px 16px 16px' }}>
          {' '}
          {content}{' '}
        </DialogContent>
      )}
      {/* <Divider /> */}

      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          color="inherit"
          onClick={onClose}
          size="small"
        >
          Cancel
        </Button>
        {action}
      </DialogActions>
    </Dialog>
  );
}
