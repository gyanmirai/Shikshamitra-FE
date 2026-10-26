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
  disableBackdropClick = true,
  disableCancel = false,
  cancelText = 'Cancel',
  ...other
}: ConfirmDialogProps) {
  const theme = useTheme();
  const titleId = React.useId();
  const contentId = React.useId();
  const isBusy =
    disableCancel ||
    (isValidElement(action) && Boolean((action.props as { loading?: boolean }).loading));

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      aria-labelledby={titleId}
      aria-describedby={content ? contentId : undefined}
      onClose={(_event, reason) => {
        if (isBusy) return;
        if (disableBackdropClick && reason === 'backdropClick') return;
        onClose();
      }}
      {...other}
      disableEscapeKeyDown={isBusy || other.disableEscapeKeyDown}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: 0,
      }}
    >
      <DialogTitle id={titleId} sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1}>
          {typeof icon === 'string' ? iconMap[icon as ConfirmIconType] : icon}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      {content && (
        <DialogContent id={contentId} sx={{ typography: 'body2', padding: '8px 16px 16px' }}>
          {' '}
          <Box component="fieldset" disabled={isBusy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
            <Box inert={isBusy || undefined}>{content}</Box>
          </Box>
        </DialogContent>
      )}
      {/* <Divider /> */}

      <DialogActions>
        <Button
          type="button"
          autoFocus
          variant="outlined"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          color="inherit"
          onClick={onClose}
          disabled={isBusy}
          size="small"
        >
          {cancelText}
        </Button>
        {isValidElement(action)
          ? cloneElement(action as React.ReactElement<any>, { size: 'small' })
          : action}
      </DialogActions>
    </Dialog>
  );
}
