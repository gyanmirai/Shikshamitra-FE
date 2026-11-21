import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import type { LibraryLoanRow } from './loan-types';

export function LoanReturnAction({
  row,
  onReturn,
}: {
  row: LibraryLoanRow;
  onReturn: (row: LibraryLoanRow) => void;
}) {
  if (row.storedStatus !== 0) return null;
  const missing = !row.id || !row.copyId;
  return (
    <AdaptiveThreeDotsActions
      directActionLimit={2}
      collapseOnOverflow={false}
      moreLabel={`More actions for ${row.accessionNo}`}
      sx={{ justifyContent: 'flex-end' }}
      actions={[
        {
          id: 'return',
          icon: GlobalIcons.retrunIcon,
          label: `Return ${row.accessionNo} from ${row.memberName || row.memberIdentifier || 'member'}`,
          disabled: missing,
          tooltip: missing
            ? 'A saved loan and copy identity are required for this return.'
            : undefined,
          onClick: () => onReturn(row),
        },
      ]}
    />
  );
}
