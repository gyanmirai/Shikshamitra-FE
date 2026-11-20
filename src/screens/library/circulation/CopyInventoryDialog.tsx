import type { RootState } from 'src/redux/store';
import type { CopyIdentity } from 'src/redux/library/copy-lifecycle-types';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Alert, Stack, Button, Typography, DialogActions, LinearProgress } from '@mui/material';

import { inventoryActions } from './inventory-actions';
import { useCopyStateSession } from './useCopyStateSession';
import { copyConditionLabel } from './events/copy-event-display';

import type { CopyActionCallbacks } from './copy-actions';
import type { CopyInventoryAction } from './inventory-actions';

export function CopyInventoryDialog({
  bookId,
  copyId,
  accessionNumber,
  onClose,
  onAction,
  ...callbacks
}: CopyIdentity &
  CopyActionCallbacks & {
    accessionNumber: string;
    onClose: () => void;
    onAction: (action: CopyInventoryAction) => void;
  }) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canView = hasGrantedPermission(permissions, 'Library.AllBooks.View');
  const { query, snapshot, retry } = useCopyStateSession({ bookId, copyId }, canView);
  const state = snapshot ? query.currentData || snapshot : undefined;
  return (
    <CustomDialog
      open
      title={`Inventory Actions — ${accessionNumber}`}
      titleInfo="Actions use this saved copy's current state and your authority. Inventory changes do not settle charges."
      hasForm={false}
      guardUnsavedChanges={false}
      handleClose={onClose}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          {!canView && <Alert severity="info">Catalogue view permission is required.</Alert>}
          {(!bookId || !copyId) && (
            <Alert severity="info">Select a saved copy with a valid book and copy identity.</Alert>
          )}
          {query.isFetching && <LinearProgress aria-label="Loading copy inventory authority" />}
          {query.isError && (
            <Alert
              severity="error"
              action={
                <Button size="small" onClick={retry}>
                  Retry
                </Button>
              }
            >
              Could not load the current copy state. No inventory action is available until it
              loads.
            </Alert>
          )}
          {state && !query.isFetching && !query.isError && (
            <FormSectionCard
              title="Current Copy State"
              icon={GlobalIcons.bookIcon}
              descriptionTooltip="Physical condition, active-loan linkage and action authority are checked by the server when an action opens and again when it is saved."
            >
              <Typography variant="body2">Condition: {copyConditionLabel(state.status)}</Typography>
              {state.requiresLoanReconciliation && (
                <Alert severity="warning">
                  Loan reconciliation is required before this copy can be changed or returned.
                </Alert>
              )}
              {state.hasOpenLoan && (
                <Alert severity="info">
                  An open loan remains recorded. Changing physical condition does not close it or
                  settle charges.
                </Alert>
              )}
              <AdaptiveThreeDotsActions
                actions={inventoryActions(state, permissions, callbacks, onAction)}
                directActionLimit={2}
                collapseOnOverflow={false}
                moreLabel={`More inventory actions for ${state.accessionNumber}`}
              />
            </FormSectionCard>
          )}
        </Stack>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
