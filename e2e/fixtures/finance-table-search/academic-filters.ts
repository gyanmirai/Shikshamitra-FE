const noop = () => {};
export function useFinanceAcademicFilters() {
  return {
    isReady: true,
    boards: [],
    mediums: [],
    classes: [],
    divisions: [],
    classOptions: [],
    divisionOptions: [],
    selectedBoard: 'board',
    selectedMedium: 'medium',
    selectedStandardId: 'All Classes',
    selectedDivisionId: 'All Divisions',
    isDivisionDisabled: true,
    classesLoading: false,
    filterPayload: { boardId: 'board', educationMediumId: 'medium' },
    setSelectedBoard: noop,
    setSelectedMedium: noop,
    setSelectedStandardId: noop,
    setSelectedDivisionId: noop,
  };
}
