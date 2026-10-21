import { useState } from 'react';
import { Alert, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useDeleteSchoolDocumentMutation } from 'src/redux/InstituteSetup/schoolDocumentsApi';

import { schoolDocumentError } from '../document-form';

export function DocumentDelete({
  document,
  onClose,
  onDeleted,
}: {
  document: { id: string; name: string };
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [remove, state] = useDeleteSchoolDocumentMutation();
  const [error, setError] = useState('');
  return (
    <ConfirmDialog
      open
      title="Delete School Document?"
      disableBackdropClick
      disableCancel={state.isLoading}
      onClose={() => {
        if (!state.isLoading) onClose();
      }}
      content={
        <>
          Delete <strong>{document.name}</strong> and remove all its attachments from the library?
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </>
      }
      action={
        <Button
          type="button"
          size="small"
          color="error"
          variant="contained"
          loading={state.isLoading}
          disabled={state.isLoading}
          startIcon={<Iconify icon={GlobalIcons.delete} />}
          onClick={async () => {
            setError('');
            try {
              await remove(document.id).unwrap();
              shikshaMitraToast.success({ message: 'School document deleted.' });
              onDeleted();
            } catch (failure) {
              setError(schoolDocumentError(failure));
            }
          }}
        >
          Delete
        </Button>
      }
    />
  );
}
