import type { RootState } from 'src/redux/store';
import type { CopyIdentity } from 'src/redux/library/copy-lifecycle-types';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Button, DialogActions, LinearProgress } from '@mui/material';

import { CopyMoveFields } from './CopyMoveFields';
import { useCopyMoveDraft } from './useCopyMoveDraft';
import { useCopyMoveSession } from './useCopyMoveSession';

export function CopyMoveDialog({
  bookId,
  copyId,
  accessionNumber,
  onClose,
}: CopyIdentity & { accessionNumber: string; onClose: () => void }) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = (currentYear as { id?: string })?.id;
  const authorized =
    hasGrantedPermission(permissions, 'Library.AllBooks.View') &&
    hasGrantedPermission(permissions, 'Library.AllBooks.Update');
  const { query, options, retry } = useCopyMoveSession(
    { bookId, copyId, academicYearId },
    authorized
  );
  const { formik, busy, error, canMove } = useCopyMoveDraft(options, authorized, onClose);
  const guard = useUnsavedNavigation(formik.dirty, {
    blockNavigation: busy,
    guardContextChanges: true,
    onNavigationApproved: onClose,
    onBeforeTraversal: onClose,
  });
  const requestClose = () => guard.requestNavigation(() => undefined);
  return (
    <>
      <CustomDialog
        open
        title={`Move Copy — ${accessionNumber}`}
        titleInfo="Record a physical move with its reason. Saved accession numbers, history and charges are retained."
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        disableEscapeKeyDown={busy}
        handleClose={requestClose}
      >
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
        >
          <DialogScrollContent>
            <FormBusyRegion busy={busy} showOverlay={false} label="Moving saved copy">
              <FormSectionCard
                title="Destination Location"
                icon={GlobalIcons.building}
                descriptionTooltip="Choose a real Library section and one of its shelves. Every move records the previous and new location."
              >
                {query.isFetching && <LinearProgress aria-label="Loading move destinations" />}
                {!authorized && (
                  <Alert severity="info">
                    Catalogue view and update permissions are required to move a copy.
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
                    Could not load the current copy state and move destinations.
                  </Alert>
                )}
                {options && !canMove && (
                  <Alert severity="warning">
                    This copy cannot be moved in its current state.{' '}
                    {options.state.blockedReasons.join(' ')}
                  </Alert>
                )}
                {options && canMove && !options.sections.length && (
                  <Alert severity="info">
                    No move destinations are available. Ask an authorized user to configure sections
                    and shelves.
                  </Alert>
                )}
                {error && (
                  <Alert severity="error">
                    {error} Your draft is retained. Close and reopen to reload the copy state before
                    reviewing and retrying.
                  </Alert>
                )}
                <CopyMoveFields
                  formik={formik}
                  options={options}
                  disabled={busy || !canMove || !options?.sections.length}
                />
              </FormSectionCard>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              onClick={requestClose}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              variant="contained"
              color="inherit"
              loading={busy}
              disabled={!canMove || !options?.sections.length}
              startIcon={<Iconify icon={GlobalIcons.building} />}
            >
              Move copy
            </Button>
          </DialogActions>
        </Box>
      </CustomDialog>
      {guard.confirmation}
    </>
  );
}
