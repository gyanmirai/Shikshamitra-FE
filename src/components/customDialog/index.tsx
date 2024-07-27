import React from 'react';

import { Dialog, useTheme, DialogTitle } from '@mui/material';

interface CustomDialogProps {
  open: boolean;
  handleClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void;
  title: string;
  children: React.ReactNode;
}

const CustomDialog = ({ open, handleClose, title, children }: CustomDialogProps) => {
  const theme = useTheme();
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={handleClose}
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
    >
      <DialogTitle sx={{ minHeight: 76 }}>{title}</DialogTitle>
      {children}
    </Dialog>
  );
};

export default CustomDialog;
