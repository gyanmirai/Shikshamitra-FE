import { useState, useEffect } from 'react';
import { Alert, Button } from '@mui/material';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

export function BookSaveNotice({
  error,
  savedAwaitingReload,
  canReload,
  dirty,
  disabled,
  reload,
  onBusyChange,
}: {
  error: string;
  savedAwaitingReload: boolean;
  canReload: boolean;
  dirty: boolean;
  disabled: boolean;
  reload: () => Promise<void>;
  onBusyChange: (busy: boolean) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    onBusyChange(loading);
    return () => onBusyChange(false);
  }, [loading, onBusyChange]);
  const read = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await reload();
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Alert
        severity="error"
        action={
          canReload && !savedAwaitingReload ? (
            <Button
              size="small"
              disabled={disabled || loading}
              onClick={() => {
                if (dirty) setConfirm(true);
                else read();
              }}
            >
              Reload saved book
            </Button>
          ) : undefined
        }
      >
        {error}
        {savedAwaitingReload &&
          ' The book was saved. Reload its saved copies before making more changes.'}
      </Alert>
      {confirm &&
        renderUnsavedConfirmation(
          () => setConfirm(false),
          () => {
            setConfirm(false);
            read();
          },
          {
            description: 'Discard this draft and load the latest saved book for review?',
            busy: disabled || loading,
          }
        )}
    </>
  );
}
