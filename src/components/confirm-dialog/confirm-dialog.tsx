import type { JSX } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Info from '@mui/icons-material/Info';
import { GlobalIcons } from 'src/utils/icons';
import Error from '@mui/icons-material/Error';
import { useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CheckCircle from '@mui/icons-material/CheckCircle';
import React, { cloneElement, isValidElement } from 'react';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { Box, Typography, DialogTitle } from '@mui/material';

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
  disableBackdropClick = false,
  ...other
}: ConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={(_event, reason) => {
        if (disableBackdropClick && reason === 'backdropClick') return;
        onClose();
      }}
      {...other}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: 0,
      }}
    >
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
        {isValidElement(action)
          ? cloneElement(action as React.ReactElement<any>, { size: 'small' })
          : action}
      </DialogActions>
    </Dialog>
  );
}
