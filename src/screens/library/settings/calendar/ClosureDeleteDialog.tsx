import type { LibraryCalendarClosure } from 'src/redux/library/calendar-types';

import { useState } from 'react';
import { Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useDeleteLibraryCalendarClosureMutation } from 'src/redux/library/calendar-api';

export function ClosureDeleteDialog({
  item,
  onClose,
}: {
  item: LibraryCalendarClosure;
  onClose: () => void;
}) {
  const [remove, result] = useDeleteLibraryCalendarClosureMutation();
  const [error, setError] = useState('');
  const submit = async () => {
    setError('');
    try {
      await remove(item.id).unwrap();
      shikshaMitraToast.success({ message: 'Library closure deleted.' });
      onClose();
    } catch (cause) {
      setError(
        parseApiProblemDetail(cause).detail || 'Could not delete this closure. Please retry.'
      );
    }
  };
  return (
    <ConfirmDialog
      open
      title="Delete Library Closure?"
      onClose={() => {
        if (!result.isLoading) onClose();
      }}
      disableCancel={result.isLoading}
      disableEscapeKeyDown={result.isLoading}
      disableBackdropClick={result.isLoading}
      content={
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          Delete the closure from {item.fromDate} through {item.toDate} ({item.reason})? Future
          calculations will use the remaining calendar.
        </>
      }
      action={
        <LoadingButton
          size="small"
          color="error"
          variant="contained"
          loading={result.isLoading}
          onClick={submit}
          startIcon={<Iconify icon={GlobalIcons.delete} />}
        >
          Delete
        </LoadingButton>
      }
    />
  );
}
