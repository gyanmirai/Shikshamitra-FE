import type { RootState } from 'src/redux/store';
import type { PaperProps, DialogProps, DialogContentProps } from '@mui/material';

import React, { useRef } from 'react';
import { Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Dialog, IconButton, Typography, DialogContent } from '@mui/material';

import { Scrollbar } from '../scrollbar';

import type { ScrollbarProps } from '../scrollbar';

type CustomDialogProps = Omit<DialogProps, 'title'> & {
  handleClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  title: React.ReactNode | string;
  children: React.ReactNode;
  paperProps?: PaperProps;
  hasForm?: boolean;
};

const CustomDialog = ({
  open,
  handleClose,
  title,
  children,
  paperProps,
  hasForm = true,
  maxWidth = 'xs',
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

  const FormComponent = hasForm ? 'form' : Box;
  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth={maxWidth}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: theme.transitions.duration.shortest - 80,
      }}
      PaperProps={{
        sx: {
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          borderRadius: '16px', // Modern rounded corners
          boxShadow: theme.customShadows?.dialog || theme.shadows[24], // Premium shadow
          '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
          ...(sx || {}),
        },
        ...paper,
      }}
      {...props}
    >
      <FormComponent id="dialog-form" style={{ height: '100%' }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            py: 2.1,
            px: 2,
            boxShadow: 'var(--shadows-3)',
          }} // Increased padding for header
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => handleCloseDialog({}, 'escapeKeyDown')}
            sx={{
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
                transform: 'scale(1.1)',
              },
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Subtle separator using border instead of full Divider for cleaner look */}
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, width: '100%' }} />

        {children}
      </FormComponent>
    </Dialog>
  );
};
export default CustomDialog;

export const DialogScrollContent = ({
  children,
  scrollBarProps = {},
  ...props
}: { children: React.ReactNode; scrollBarProps?: ScrollbarProps } & DialogContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <Scrollbar ref={ref} {...scrollBarProps}>
      <DialogContent
        ref={ref}
        sx={{
          p: 2, // Increased content padding for better readability
          ...props.sx,
        }}
        {...props}
      >
        {children}
      </DialogContent>
    </Scrollbar>
  );
};
