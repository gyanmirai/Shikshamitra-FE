import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Alert, Stack, Button, LinearProgress } from '@mui/material';

import { BookEditorForm } from './BookEditorForm';
import { useBookEditorSnapshot } from './useBookEditorSnapshot';
import { BookEditorOptionsContext } from './book-editor-options-context';

import type { BookFormValues } from '../Components/type';

export function BookEditor({
  initialValues,
  academicYearId,
  onClose,
  onBusyChange,
}: {
  initialValues: BookFormValues;
  academicYearId?: string;
  onClose: (event: unknown, submitted: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canRead =
    hasGrantedPermission(permissions, 'Library.AllBooks.View') &&
    (hasGrantedPermission(permissions, 'Library.AllBooks.Add') ||
      hasGrantedPermission(permissions, 'Library.AllBooks.Update'));
  const state = useBookEditorSnapshot(academicYearId, canRead);
  const [formBusy, setFormBusy] = useState(false);
  const busy = formBusy || state.loading;
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  const configuration = state.snapshot?.catalogueConfiguration;
  const options = useMemo(
    () =>
      state.snapshot
        ? { academicYearId: state.year, options: state.snapshot, refresh: state.refresh }
        : null,
    [state.year, state.snapshot, state.refresh]
  );
  return (
    <Stack spacing={1} sx={{ flex: 1, minHeight: 0 }}>
      {!canRead && (
        <Alert severity="info">
          Catalogue view and add or update permission are required to open the editor.
        </Alert>
      )}
      {!state.year && (
        <Alert severity="info">Select an academic year before opening the editor.</Alert>
      )}
      {state.loading && <LinearProgress aria-label="Loading current catalogue rules" />}
      {state.error && (
        <Alert
          severity="error"
          action={
            <Button size="small" disabled={busy} onClick={state.refresh}>
              Retry
            </Button>
          }
        >
          {state.error} Your changes are retained.
        </Alert>
      )}
      {state.contextChanged && (
        <Alert severity="info">
          This draft retains its original academic-year context. Return to that year or close and
          reopen the editor.
        </Alert>
      )}
      {state.changed && (
        <Alert
          severity="info"
          action={
            <Button size="small" disabled={busy || state.contextChanged} onClick={state.refresh}>
              Review latest rules
            </Button>
          }
        >
          Catalogue rules changed. Your opened rules and entered values are retained until you
          review the latest rules.
        </Alert>
      )}
      {state.snapshot && configuration && (
        <BookEditorOptionsContext.Provider value={options}>
          <BookEditorForm
            initialValues={initialValues}
            academicYearId={state.year}
            configuration={configuration}
            onClose={onClose}
            onBusyChange={setFormBusy}
            externalBusy={state.loading}
            contextBlocked={state.contextChanged}
          />
        </BookEditorOptionsContext.Provider>
      )}
    </Stack>
  );
}
