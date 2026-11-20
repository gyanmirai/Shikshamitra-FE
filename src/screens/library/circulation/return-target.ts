import type { LibraryReturnLookup } from 'src/redux/library/circulation-types';

export type LibraryReturnTarget = { loanId: string; copyId: string };
export type CirculationDialogState = {
  kind: 'issue' | 'return' | 'renew' | 'reviewDates';
  accessionNo: string;
  target?: LibraryReturnTarget;
  session?: number;
};
export function matchesReturnTarget(
  item: LibraryReturnLookup | undefined,
  target: LibraryReturnTarget | undefined
) {
  return Boolean(
    item &&
    target &&
    item.loan.id === target.loanId &&
    item.copy.copyId === target.copyId &&
    item.loan.copyId === item.copy.copyId
  );
}
