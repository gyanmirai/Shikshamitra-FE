import type { DialogProps } from '@mui/material/Dialog';

// ----------------------------------------------------------------------

export type ConfirmDialogProps = Omit<DialogProps, 'title' | 'content'> & {
  onClose: () => void;
  title: React.ReactNode;
  action: React.ReactNode;
  content?: React.ReactNode;
  icon?: React.ReactNode;
  disableBackdropClick?: boolean;
  disableCancel?: boolean;
  cancelText?: string;
  /** Opt into the standard header close control without changing existing confirmations. */
  showCloseButton?: boolean;
  /** Opt into a blocking body loader; legacy action-loading behavior is unchanged. */
  bodyBusy?: boolean;
  busyLabel?: string;
};
