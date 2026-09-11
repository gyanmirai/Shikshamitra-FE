import type { RootState } from 'src/redux/store';
import type { PaperProps, DialogProps, DialogContentProps } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { Close } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Dialog, IconButton, Typography, DialogContent } from '@mui/material';

import { Scrollbar } from '../scrollbar';
import { shouldBlockCustomDialogClose } from './close-guard';

import type { ScrollbarProps } from '../scrollbar';

type CustomDialogProps = Omit<DialogProps, 'title'> & {
  handleClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  title: React.ReactNode | string;
  children: React.ReactNode;
  paperProps?: PaperProps;
  hasForm?: boolean;
  disableClose?: boolean;
  /** Use a local close handler without clearing the parent form's dirty state. */
  guardUnsavedChanges?: boolean;
};

const CustomDialog = ({
  open,
  handleClose,
  title,
  children,
  paperProps,
  hasForm = true,
  disableClose = false,
  guardUnsavedChanges = true,
  maxWidth = 'xs',
  ...props
}: CustomDialogProps) => {
  const theme = useTheme();
  const generatedTitleId = React.useId();
  const titleId = props['aria-labelledby'] ?? generatedTitleId;
  const { sx, ...paper } = paperProps || {};
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!open || !guardUnsavedChanges) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [open, guardUnsavedChanges]);

  const handleCloseDialog = (e: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (shouldBlockCustomDialogClose(disableClose)) return;
    if (reason === 'backdropClick') return;
    if (!guardUnsavedChanges) {
      handleClose(e, reason);
      return;
    }
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
      aria-labelledby={titleId}
      open={open}
      onClose={handleCloseDialog}
      fullWidth
      maxWidth={maxWidth}
      transitionDuration={{
        enter: theme.transitions.duration.shortest,
        exit: 0,
      }}
      PaperProps={{
        sx: {
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          borderRadius: '16px', // Modern rounded corners
          boxShadow: theme.customShadows?.dialog || theme.shadows[24], // Premium shadow
          backgroundRepeat: 'no-repeat',
          // borderTop: `5px solid ${theme.palette.primary.main}`,
          backgroundImage: `url(${CONFIG.site.basePath}/assets/red-blur.png)`,
          backgroundPosition: 'bottom left',
          '& form, & #dialog-form': {
            minHeight: 0,
            display: 'flex',
            flex: '1 1 auto',
            flexDirection: 'column',
          },
          ...(sx || {}),
        },
        ...paper,
      }}
      {...props}
      disableEscapeKeyDown={disableClose || props.disableEscapeKeyDown}
    >
      <FormComponent
        id="dialog-form"
        style={{ height: '100%' }}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
        }}
      >
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
          <Typography id={titleId} variant="h6" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            disabled={disableClose}
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
  onSubmit,
  ...props
}: {
  children: React.ReactNode;
  scrollBarProps?: ScrollbarProps;
  onSubmit?: () => void;
} & Omit<DialogContentProps, 'onSubmit'>) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onSubmit && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Scrollbar ref={ref} {...scrollBarProps}>
      <DialogContent
        ref={ref}
        onKeyDown={handleKeyDown}
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
