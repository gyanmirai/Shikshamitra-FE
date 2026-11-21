import type { IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import CustomDialog from 'src/components/customDialog';

import { LoanMaintenanceDialog } from './LoanMaintenanceDialog';
import IssueBookModal from '../BookList/Components/BookView/BookIssueForm';
import ReturnBookModal from '../BookList/Components/BookView/BookReturnForm';

import type { CirculationDialogState } from './return-target';

export function CirculationDialogs({
  dialog,
  busy,
  onBusyChange,
  onClose,
  copy,
  onReload,
}: {
  dialog: CirculationDialogState | null;
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onClose: (event?: unknown, submitted?: boolean) => void;
  copy?: IBookCopyWithBook | null;
  onReload?: () => void;
}) {
  if (!dialog) return null;
  if (dialog.kind === 'renew' || dialog.kind === 'reviewDates')
    return (
      <LoanMaintenanceDialog
        key={`${dialog.kind}:${dialog.target?.loanId || ''}:${dialog.target?.copyId || ''}:${dialog.session || 0}`}
        kind={dialog.kind}
        target={dialog.target}
        accessionNo={dialog.accessionNo}
        busy={busy}
        onBusyChange={onBusyChange}
        onClose={onClose}
        onReload={onReload}
      />
    );
  return (
    <CustomDialog
      open
      maxWidth="md"
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={busy}
      disableEscapeKeyDown={busy}
      handleClose={() => onClose()}
      title={dialog.kind === 'issue' ? 'Issue Book' : 'Return Book'}
      titleInfo={
        dialog.kind === 'issue'
          ? 'Review the exact saved copy, borrower, school dates and borrowing-policy preview before issuing.'
          : 'Review the exact stored loan, school return date and recovered copy condition. Assessments remain separate obligations.'
      }
    >
      {dialog.kind === 'issue' ? (
        <IssueBookModal
          key={copy?.copyId || dialog.accessionNo}
          editData={copy || null}
          onClose={onClose}
          onBusyChange={onBusyChange}
        />
      ) : (
        <ReturnBookModal
          key={`${dialog.accessionNo}:${dialog.target?.loanId || ''}:${dialog.target?.copyId || ''}`}
          accessionNo={dialog.accessionNo}
          target={dialog.target}
          onClose={onClose}
          onBusyChange={onBusyChange}
        />
      )}
    </CustomDialog>
  );
}
