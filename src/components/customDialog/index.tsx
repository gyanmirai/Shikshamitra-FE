import type { DialogProps } from '@mui/material';

import React from 'react';

import { Dialog, useTheme, DialogTitle } from '@mui/material';

type CustomDialogProps = DialogProps & {
  handleClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
  title: string;
  children: React.ReactNode;
};

const CustomDialog = ({ open, handleClose, title, children, ...props }: CustomDialogProps) => {
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
        },
      }}
      {...props}
    >
      <DialogTitle sx={{ minHeight: 76 }}>{title}</DialogTitle>
      {children}
    </Dialog>
  );
};

export default CustomDialog;
