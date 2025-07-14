import type { ReactNode } from 'react';

import { useState } from 'react';

import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Dialog,
  Button,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

type ConfirmIconType = 'info' | 'warning' | 'success' | 'error';

interface ConfirmOptions {
  title?: string;
  message: string | ReactNode;
  icon?: ConfirmIconType;
}

interface DialogState extends ConfirmOptions {
  open: boolean;
  resolve: (result: boolean) => void;
}

const iconMap: Record<ConfirmIconType, JSX.Element> = {
  warning: <WarningAmberIcon color="warning" fontSize="large" />,
  success: <CheckCircleIcon color="success" fontSize="large" />,
  info: <InfoIcon color="info" fontSize="large" />,
  error: <ErrorIcon color="error" fontSize="large" />,
};

export function useConfirmDialog(): [(options: ConfirmOptions) => Promise<boolean>, JSX.Element] {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);

  const showConfirm = (options: ConfirmOptions): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      setDialogState({
        open: true,
        title: options.title || 'Confirm',
        message: options.message,
        icon: options.icon || 'info',
        resolve,
      });
    });

  const handleClose = (result: boolean) => {
    if (dialogState) {
      dialogState.resolve(result);
      setDialogState(null);
    }
  };

  const ConfirmDialog = dialogState ? (
    <Dialog open={dialogState.open} onClose={() => handleClose(false)}>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {iconMap[dialogState.icon!]}
          <Typography variant="h6">{dialogState.title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography>{dialogState.message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={() => handleClose(true)} variant="contained" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  ) : (
    <></>
  );

  return [showConfirm, ConfirmDialog];
}
