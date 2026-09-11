import { useState } from 'react';
import { Alert, Button } from '@mui/material';

import { ReviewReloadConfirmation } from './review-reload-confirmation';

export function ReviewRecoveryAlert({
  error,
  dirty,
  busy,
  onReload,
  context = 'review',
}: {
  error: string;
  dirty: boolean;
  busy: boolean;
  onReload: () => Promise<void>;
  context?: 'review' | 'application';
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              disabled={busy}
              onClick={() => (dirty ? setConfirm(true) : onReload())}
            >
              Reload latest {context}
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      <ReviewReloadConfirmation
        context={context}
        open={confirm}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          return onReload();
        }}
      />
    </>
  );
}
