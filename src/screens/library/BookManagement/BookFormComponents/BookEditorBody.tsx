import { Alert, Stack } from '@mui/material';

import BookCopiesStep from './BookCopiesStep';
import BookGeneralStep from './BookGeneralForm';
import { BookSaveNotice } from './BookSaveNotice';

import type { useBookEditor } from './useBookEditor';

export function BookEditorBody({
  state,
  disabled,
  printDisabled,
  onBusyChange,
}: {
  state: ReturnType<typeof useBookEditor>;
  disabled: boolean;
  printDisabled: boolean;
  onBusyChange: (busy: boolean) => void;
}) {
  return (
    <Stack spacing={2} sx={{ p: 1, minWidth: 0 }}>
      {state.error && (
        <BookSaveNotice
          error={state.error}
          savedAwaitingReload={Boolean(state.reloadId)}
          canReload={Boolean(state.formik.values.id)}
          dirty={state.formik.dirty}
          disabled={disabled}
          reload={state.reloadForReview}
          onBusyChange={onBusyChange}
        />
      )}
      {state.completed && !state.formik.dirty && (
        <Alert severity="success">
          The book is saved. You can print saved labels or choose Done.
        </Alert>
      )}
      {state.activeStep === 0 ? (
        <BookGeneralStep formik={state.formik} disabled={disabled} onBusyChange={onBusyChange} />
      ) : (
        <BookCopiesStep formik={state.formik} disabled={disabled} printDisabled={printDisabled} />
      )}
    </Stack>
  );
}
