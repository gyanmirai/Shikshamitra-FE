import type { AlertProps } from '@mui/material';

import { toast } from 'sonner';
import { Alert, AlertTitle } from '@mui/material';
import { safeHrText } from 'src/screens/hr/recovery/hr-failure';
import { isHrRecoveryVisible } from 'src/screens/hr/recovery/hr-recovery-events';
import {
  formatPermissionDenied,
  isPermissionDeniedMessage,
  isGenericPermissionMessage,
} from 'src/utils/permission-denied';

export const shikshaMitraToast = {
  dismiss: (id?: string | number) => toast.dismiss(id),
  error: ({
    message,
    alertProps,
  }: {
    message: React.ReactNode;
    alertProps?: AlertProps | ((t: string | number) => AlertProps);
  }) => {
    // HR mutation failures already own persistent, accessible feedback. Do not announce
    // the same request again through legacy catch/helper toasts while that dialog is open.
    if (isHrRecoveryVisible()) return 'hr-recovery-dialog';
    if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/hr/') &&
      typeof message === 'string'
    ) {
      message =
        safeHrText(message) ?? 'The request could not be completed. Review the form and try again.';
    }
    const resolvedMessage =
      typeof message === 'string' && isGenericPermissionMessage(message)
        ? formatPermissionDenied()
        : message;
    const permissionDenied =
      typeof resolvedMessage === 'string' && isPermissionDeniedMessage(resolvedMessage);
    return toast.custom(
      (t) => {
        if (typeof alertProps === 'function') {
          alertProps = alertProps(t);
        }
        return (
          <Alert
            severity={permissionDenied ? 'warning' : 'error'}
            variant={permissionDenied ? 'standard' : 'filled'}
            onClose={() => {
              toast.dismiss(t);
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              '& .MuiAlert-message': { minWidth: 0, overflowWrap: 'anywhere' },
              '& .MuiAlert-action': {
                alignItems: 'center',
                ...(permissionDenied && {
                  '& button': { minWidth: 44, minHeight: 44 },
                }),
              },
            }}
            {...alertProps}
          >
            {permissionDenied && <AlertTitle>Access required</AlertTitle>}
            {resolvedMessage}
          </Alert>
        );
      },
      permissionDenied
        ? { id: `permission:${String(resolvedMessage)}`, duration: 10000 }
        : undefined
    );
  },
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
