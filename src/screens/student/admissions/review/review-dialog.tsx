import type { ReactNode } from 'react';
import type { DialogProps } from '@mui/material';

import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';

export function ReviewDialog({
  open = true,
  title,
  maxWidth = 'sm',
  dirty,
  busy,
  onClose,
  children,
  actions,
}: {
  open?: boolean;
  title: string;
  maxWidth?: DialogProps['maxWidth'];
  dirty: boolean;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
  actions: (requestClose: () => void) => ReactNode;
}) {
  const [discard, setDiscard] = useState(false);
  useEffect(() => {
    if (!open || !dirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, open]);
  const requestClose = () => {
    if (busy) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  return (
    <>
      <CustomDialog
        open={open}
        title={title}
        maxWidth={maxWidth}
        handleClose={requestClose}
        hasUnsavedChanges={false}
        disableClose={busy}
      >
        {children}
        {actions(requestClose)}
      </CustomDialog>
      <ConfirmDialog
        open={discard}
        onClose={() => setDiscard(false)}
        title="Discard unsaved changes?"
        icon="warning"
        content="Saved information remains available. Changes made in this dialog will be discarded."
        action={
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setDiscard(false);
              onClose();
            }}
          >
            Discard changes
          </Button>
        }
      />
    </>
  );
}
