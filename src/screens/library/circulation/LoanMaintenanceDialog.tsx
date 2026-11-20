import type { RootState } from 'src/redux/store';

import { Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { LookupFeedback } from './LookupFeedback';
import { LoanRenewalForm } from './LoanRenewalForm';
import { useCirculationBusy } from './useCirculationBusy';
import { LoanDateReviewForm } from './LoanDateReviewForm';
import { useExactLoanSession } from './useExactLoanSession';
import { CirculationFormFooter } from './CirculationFormFooter';

import type { LibraryReturnTarget } from './return-target';
import type { LoanMaintenanceKind } from './loan-maintenance-types';

export function LoanMaintenanceDialog({
  kind,
  target,
  accessionNo,
  busy,
  onBusyChange,
  onClose,
  onReload,
}: {
  kind: LoanMaintenanceKind;
  target?: LibraryReturnTarget;
  accessionNo: string;
  busy: boolean;
  onBusyChange: (value: boolean) => void;
  onClose: (event?: unknown, submitted?: boolean) => void;
  onReload?: () => void;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const action = kind === 'renew' ? 'Renew' : 'ReviewDates';
  const allowed =
    hasGrantedPermission(permissions, 'Library.IssueReturn.View') &&
    hasGrantedPermission(permissions, `Library.IssueReturn.${action}`);
  const session = useExactLoanSession(target, allowed);
  useCirculationBusy(session.opening, onBusyChange);
  const Form = kind === 'renew' ? LoanRenewalForm : LoanDateReviewForm;
  return (
    <CustomDialog
      open
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      title={kind === 'renew' ? 'Renew Book' : 'Review School Dates'}
      titleInfo={
        kind === 'renew'
          ? 'Review the exact saved loan, its borrowing terms and the current renewal preview.'
          : 'Confirm eligible historical school dates from reliable evidence while retaining the original timestamps.'
      }
      disableClose={busy || session.opening}
      disableEscapeKeyDown={busy || session.opening}
      handleClose={() => onClose()}
    >
      {session.snapshot ? (
        <Form
          loan={session.snapshot}
          session={session}
          allowed={allowed}
          accessionNo={accessionNo}
          onClose={onClose}
          onBusyChange={onBusyChange}
          onReload={onReload}
        />
      ) : (
        <>
          <DialogScrollContent>
            {!allowed ? (
              <Alert severity="info">Your current access does not allow this loan action.</Alert>
            ) : (
              <LookupFeedback
                label="saved loan"
                pending={session.opening}
                error={session.error}
                onRetry={session.retry}
              />
            )}
          </DialogScrollContent>
          <CirculationFormFooter
            busy={session.opening}
            disabled
            label={kind === 'renew' ? 'Renew' : 'Confirm dates'}
            onCancel={() => onClose()}
          />
        </>
      )}
    </CustomDialog>
  );
}
