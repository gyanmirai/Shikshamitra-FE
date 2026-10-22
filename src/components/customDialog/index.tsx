import type { RootState } from 'src/redux/store';
import type { PaperProps, DialogProps, DialogContentProps } from '@mui/material';

import { CONFIG } from 'src/config-global';
import Close from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Dialog, IconButton, Typography, DialogContent } from '@mui/material';

import { Scrollbar } from '../scrollbar';
import CustomTooltip from '../custom-tooltip';
import { shouldBlockCustomDialogClose } from './close-guard';

import type { ScrollbarProps } from '../scrollbar';

type CustomDialogProps = Omit<DialogProps, 'title'> & {
  handleClose: (event?: {}, reason?: 'backdropClick' | 'escapeKeyDown') => void;
  title: React.ReactNode | string;
  titleInfo?: string;
  children: React.ReactNode;
  paperProps?: PaperProps;
  hasForm?: boolean;
  formProps?: { noValidate?: boolean; onSubmit?: (event: React.FormEvent) => void };
  disableClose?: boolean;
  /** Local form state, when supplied, must not consume or clear a parent form's dirty state. */
  hasUnsavedChanges?: boolean;
  /** Use a local close handler without clearing the parent form's dirty state. */
  guardUnsavedChanges?: boolean;
};

const CustomDialog = ({
  open,
  handleClose,
  title,
  titleInfo,
  children,
  paperProps,
  hasForm = true,
  formProps,
  disableClose = false,
  hasUnsavedChanges,
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
  const isDirty = hasUnsavedChanges ?? isChanges;

  useEffect(() => {
    if (!open || !guardUnsavedChanges || !isDirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [open, guardUnsavedChanges, isDirty]);

  const handleCloseDialog = (e: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (shouldBlockCustomDialogClose(disableClose)) return;
    if (reason === 'backdropClick') return;
    if (!guardUnsavedChanges) {
      handleClose(e, reason);
      return;
    }
    if (isDirty && window.confirm('Are you sure you want to leave this page?')) {
      handleClose(e, reason);
      if (hasUnsavedChanges === undefined) dispatch(setIsChanges(false));
    } else if (!isDirty) {
      handleClose(e, reason);
    }
  };

  const FormComponent = hasForm ? 'form' : 'div';
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
        {...(hasForm ? formProps : {})}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            <Typography id={titleId} variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {titleInfo && (
              <CustomTooltip arrow placement="bottom" title={titleInfo}>
                <IconButton
                  size="small"
                  aria-label={typeof title === 'string' ? `${title} information` : 'Dialog information'}
                  sx={{ color: 'info.main', flexShrink: 0 }}
                >
                  <InfoOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </CustomTooltip>
            )}
          </Box>
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
