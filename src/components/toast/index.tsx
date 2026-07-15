import type { AlertProps } from '@mui/material';

import { toast } from 'sonner';
import { Alert } from '@mui/material';

export const shikshaMitraToast = {
  error: ({
    message,
    alertProps,
  }: {
    message: React.ReactNode;
    alertProps?: AlertProps | ((t: string | number) => AlertProps);
  }) =>
    toast.custom((t) => {
      if (typeof alertProps === 'function') {
        alertProps = alertProps(t);
      }
      return (
        <Alert
          severity="error"
          variant="outlined"
          onClose={() => {
            toast.dismiss(t);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '& .MuiAlert-action': {
              alignItems: 'center',
            },
          }}
          {...alertProps}
        >
          {message}
        </Alert>
      );
    }),
  success: ({
    message,
    alertProps,
  }: {
    message: React.ReactNode;
    alertProps?: AlertProps | ((t: string | number) => AlertProps);
  }) =>
    toast.custom((t) => {
      if (typeof alertProps === 'function') {
        alertProps = alertProps(t);
      }
      return (
        <Alert
          severity="success"
          variant="filled"
          onClose={() => {
            toast.dismiss(t);
          }}
          sx={{
            alignItems: 'center',
            '& .MuiAlert-message': {
              width: '100%',
            },
            '& .MuiAlert-action': {
              alignItems: 'center',
            },
          }}
          {...alertProps}
        >
          {message}
        </Alert>
      );
    }),
  info: ({
    message,
    alertProps,
  }: {
    message: React.ReactNode | ((t: string | number) => React.ReactNode);
    alertProps?: AlertProps | ((t: string | number) => AlertProps);
  }) =>
    toast.custom((t) => {
      const resolvedMessage = typeof message === 'function' ? message(t) : message;
      if (typeof alertProps === 'function') {
        alertProps = alertProps(t);
      }
      return (
        <Alert
          severity="info"
          variant="filled"
          onClose={() => {
            toast.dismiss(t);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '& .MuiAlert-action': {
              alignItems: 'center',
            },
          }}
          {...alertProps}
        >
          {resolvedMessage}
        </Alert>
      );
    }),
  warning: ({
    message,
    alertProps,
  }: {
    message: React.ReactNode;
    alertProps?: ((t: string | number) => AlertProps) | AlertProps;
  }) =>
    toast.custom((t) => {
      if (typeof alertProps === 'function') {
        alertProps = alertProps(t);
      }
      return (
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => {
            toast.dismiss(t);
          }}
          sx={{
            alignItems: 'center', // ✅ aligns icon, content, and close icon vertically
            '& .MuiAlert-action': {
              alignItems: 'center', // ✅ specifically targets the close icon wrapper
            },
          }}
          {...alertProps}
        >
          {message}
        </Alert>
      );
    }),

  promise: (
    promise: Promise<any>,
    {
      pending,
      success,
      error,
    }: { pending?: React.ReactNode; success?: React.ReactNode; error?: React.ReactNode }
  ) =>
    toast.promise(promise, {
      loading: pending,
      success,
      error,
    }),
};
