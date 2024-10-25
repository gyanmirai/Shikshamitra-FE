import type { PaperProps, DialogProps } from '@mui/material';

import React from 'react';

import { Close } from '@mui/icons-material';
import { Dialog, useTheme, IconButton, DialogTitle } from '@mui/material';

type CustomDialogProps = DialogProps & {
  handleClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  title: string;
  children: React.ReactNode;
  paperProps?: PaperProps;
};

const CustomDialog = ({
  open,
  handleClose,
  title,
  children,
  paperProps,
  ...props
}: CustomDialogProps) => {
  const theme = useTheme();
  const { sx, ...paper } = paperProps || {};
  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (reason === 'backdropClick') return;
        handleClose(e, reason);
      }}
      fullWidth
      maxWidth="xs"
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      PaperProps={{
        sx: {
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
          ...(sx || {}),
        },
        ...paper,
      }}
      {...props}
    >
      <DialogTitle sx={{ minHeight: 76 }}>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => handleClose()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>
      {children}
    </Dialog>
  );
};
export default CustomDialog;
