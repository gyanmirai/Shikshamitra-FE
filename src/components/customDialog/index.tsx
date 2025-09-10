import type { RootState } from 'src/redux/store';
import type { PaperProps, DialogProps, DialogContentProps } from '@mui/material';

import React, { useRef } from 'react';
import { Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Dialog, Divider, IconButton, Typography, DialogContent } from '@mui/material';

import { Scrollbar } from '../scrollbar';

type CustomDialogProps = Omit<DialogProps, 'title'> & {
  handleClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  title: React.ReactNode | string;
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
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const handleCloseDialog = (e: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick') return;
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      handleClose(e, reason);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      handleClose(e, reason);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
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
      <form id="dialog-form">
        <Box display="flex" alignItems="center" justifyContent="space-between" py={1} px={2}>
          <Typography variant="h5">{title}</Typography>
          <IconButton
            aria-label="close"
            onClick={() => handleCloseDialog({}, 'escapeKeyDown')}
            sx={{ color: theme.vars.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </Box>
        <Divider />
        {children}
      </form>
    </Dialog>
  );
};
export default CustomDialog;

export const DialogScrollContent = ({
  children,
  ...props
}: { children: React.ReactNode } & DialogContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Scrollbar ref={ref}>
      <DialogContent ref={ref} sx={{ p: 2 }} {...props}>
        {children}
      </DialogContent>
    </Scrollbar>
  );
};
