import type { ReactNode } from 'react';

import { LoadingButton } from '@mui/lab';
import { Alert, Box, Stack } from '@mui/material';
import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { getFinanceSettingErrorMessage } from './finance-setting-error';

interface FinanceSettingDeleteDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  onDelete: (() => Promise<unknown>) | undefined;
  successMessage: string;
}

export function FinanceSettingDeleteDialog({
  open,
  title,
  children,
  onClose,
  onDelete,
  successMessage,
}: FinanceSettingDeleteDialogProps) {
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const inFlight = useRef(false);

  const close = () => {
    if (inFlight.current) return;
    setError('');
    onClose();
  };

  const confirm = async () => {
    if (!onDelete || inFlight.current) return;
    inFlight.current = true;
    setIsDeleting(true);
    setError('');
    try {
      await onDelete();
    } catch (requestError) {
      setError(
        getFinanceSettingErrorMessage(
          requestError,
          `Could not ${title.toLowerCase()}. Refresh the list to check this record before retrying.`
        )
      );
      return;
    } finally {
      inFlight.current = false;
      setIsDeleting(false);
    }
    shikshaMitraToast.success({ message: successMessage });
    close();
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={close}
      title={title}
      content={
        <Stack spacing={2}>
          <Box>{children}</Box>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      }
      action={
        <LoadingButton
          type="button"
          startIcon={<Iconify icon={GlobalIcons.delete} />}
          variant="contained"
          color="error"
          size="small"
          loading={isDeleting}
          disabled={!onDelete}
          onClick={confirm}
        >
          Delete
        </LoadingButton>
      }
    />
  );
}
