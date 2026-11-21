import type { RootState } from 'src/redux/store';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions/types';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import type { LibraryLoanRow } from './loan-types';

export type LoanActionHandlers = {
  onReturn?: (row: LibraryLoanRow) => void;
  onRenew?: (row: LibraryLoanRow) => void;
  onReviewDates?: (row: LibraryLoanRow) => void;
};

export function LoanActions({
  row,
  onReturn,
  onRenew,
  onReviewDates,
}: LoanActionHandlers & { row: LibraryLoanRow }) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  if (!hasGrantedPermission(permissions, 'Library.IssueReturn.View')) return null;
  const missing = !row.id || !row.copyId;
  const borrower = row.memberName || row.memberIdentifier || 'member';
  const actions: AdaptiveThreeDotsAction[] = [];
  const add = (
    id: string,
    icon: string,
    label: string,
    callback?: (item: LibraryLoanRow) => void
  ) => {
    if (!callback || !hasGrantedPermission(permissions, `Library.IssueReturn.${id}`)) return;
    actions.push({
      id: id === 'ReviewDates' ? 'review-dates' : id.toLowerCase(),
      icon,
      label,
      disabled: missing,
      tooltip: missing ? 'A saved loan and copy identity are required for this action.' : undefined,
      onClick: () => callback(row),
    });
  };
  if (row.storedStatus === 0) {
    add('Return', GlobalIcons.retrunIcon, `Return ${row.accessionNo} from ${borrower}`, onReturn);
    add('Renew', GlobalIcons.refresh, `Renew ${row.accessionNo} for ${borrower}`, onRenew);
  }
  add(
    'ReviewDates',
    GlobalIcons.calendar,
    `Review school dates for ${row.accessionNo} and ${borrower}`,
    onReviewDates
  );
  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      directActionLimit={2}
      collapseOnOverflow
      moreLabel={`More actions for ${row.accessionNo}`}
      sx={{ justifyContent: 'flex-end' }}
    />
  );
}
