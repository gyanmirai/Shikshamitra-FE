const withoutAll = (divisionIds: string[]) => divisionIds.filter((id) => id !== 'all');

export const getDisplayedDivisionSelection = (divisionIds: string[]) =>
  divisionIds.includes('all') ? ['all'] : divisionIds;

export const resolveDivisionSelection = (
  nextVisibleSelection: string[],
  previousSelection: string[],
  allDivisionIds: string[]
) => {
  const selectedDivisionIds = withoutAll(nextVisibleSelection);
  const wasAllSelected = previousSelection.includes('all');
  const isAllSelected = nextVisibleSelection.includes('all');

  if (wasAllSelected) {
    if (!isAllSelected) return [];
    if (selectedDivisionIds.length > 0) return selectedDivisionIds;
    return ['all', ...allDivisionIds];
  }

  if (isAllSelected) return ['all', ...allDivisionIds];

  return selectedDivisionIds.length > 0 && selectedDivisionIds.length === allDivisionIds.length
    ? ['all', ...allDivisionIds]
    : selectedDivisionIds;
};
