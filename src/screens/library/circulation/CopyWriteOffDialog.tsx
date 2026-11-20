import type { RootState } from 'src/redux/store';
import type { CopyIdentity } from 'src/redux/library/copy-lifecycle-types';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FormSectionCard } from 'src/components/form-section-card';
import { Alert, Stack, Button, LinearProgress } from '@mui/material';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';

import { CopyActionReason } from './CopyActionReason';
import { useCopyStateSession } from './useCopyStateSession';
import { useCopyWriteOffDraft } from './useCopyWriteOffDraft';

export function CopyWriteOffDialog({
  bookId,
  copyId,
  accessionNumber,
  onClose,
}: CopyIdentity & { accessionNumber: string; onClose: () => void }) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const authorized =
    hasGrantedPermission(permissions, 'Library.AllBooks.View') &&
    hasGrantedPermission(permissions, 'Library.AllBooks.Delete');
  const { query, snapshot, retry } = useCopyStateSession({ bookId, copyId }, authorized);
  const { formik, error, busy, canWriteOff } = useCopyWriteOffDraft(snapshot, authorized, onClose);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
  });
  const requestClose = () => guard.requestNavigation(() => undefined);
  return (
    <>
      <ConfirmDialog
        open
        title={`Write Off Copy — ${accessionNumber}?`}
        icon="warning"
        onClose={requestClose}
        disableCancel={busy}
        disableEscapeKeyDown={busy}
        disableBackdropClick
        bodyBusy={busy}
        busyLabel="Writing off saved copy"
        content={
          <Stack spacing={2}>
            <span>
              This permanently retires the physical copy. Its history and outstanding charges remain
              recorded. Open loans must be returned or reconciled first.
            </span>
            {query.isFetching && <LinearProgress aria-label="Loading write-off authority" />}
            {!authorized && (
              <Alert severity="info">
                Catalogue view and delete permissions are required to write off a copy.
              </Alert>
            )}
            {query.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={retry}>
                    Retry
                  </Button>
                }
              >
                Could not load the current copy state and write-off authority.
              </Alert>
            )}
            {snapshot && !canWriteOff && (
              <Alert severity="warning">
                This copy cannot be written off in its current state.{' '}
                {snapshot.blockedReasons.join(' ')}
              </Alert>
            )}
            {error && (
              <Alert severity="error">
                {error} Your reason is retained. Close and reopen to load the current copy state,
                then review before retrying.
              </Alert>
            )}
            <FormSectionCard
              title="Write-Off Reason"
              icon={GlobalIcons.bookIcon}
              descriptionTooltip="The reason is saved in the immutable copy event history. This action does not settle charges."
            >
              <CopyActionReason
                value={formik.values.reason}
                error={formik.touched.reason ? formik.errors.reason : undefined}
                disabled={busy || !canWriteOff}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </FormSectionCard>
          </Stack>
        }
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            color="error"
            loading={busy}
            disabled={!canWriteOff}
            onClick={() => formik.submitForm()}
            startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Write off copy
          </Button>
        }
      />
      {guard.confirmation}
    </>
  );
}
