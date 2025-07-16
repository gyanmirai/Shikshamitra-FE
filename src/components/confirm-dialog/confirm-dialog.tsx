import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { Box, useTheme, Typography, DialogTitle } from '@mui/material';
import { Info, Error, CheckCircle, WarningAmber } from '@mui/icons-material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from '../iconify';

import type { ConfirmDialogProps } from './types';

type ConfirmIconType = 'info' | 'warning' | 'success' | 'error';
// ----------------------------------------------------------------------
const iconMap: Record<ConfirmIconType, JSX.Element> = {
  warning: <WarningAmber color="warning" fontSize="large" />,
  success: <CheckCircle color="success" fontSize="large" />,
  info: <Info color="info" fontSize="large" />,
  error: <Error color="error" fontSize="large" />,
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
  const theme = useTheme();

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {iconMap[icon as ConfirmIconType]}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      {content && (
        <DialogContent sx={{ typography: 'body2', p: 2, py: 2.5 }}> {content} </DialogContent>
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
