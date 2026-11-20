export const medium = {
  id: 'medium-a', name: 'English', educationBoardId: 'board-a',
  educationMediumStages: [{ id: 'stage-a', name: 'Primary', educationMediumId: 'medium-a',
    standards: [{ id: 'class-a', name: 'Class 1', educationMediumStageId: 'stage-a', divisions: [{ id: 'division-a', name: 'A', standardId: 'class-a' }] }] }],
};
export const years = ['year-a', 'year-b'].map((id, index) => ({ id, name: index ? '2027–2028' : '2026–2027', startDate: '2026-06-01', endDate: '2027-05-31' }));
export const boards = years.map((year) => ({ id: 'board-a', name: 'GSEB', type: 0, academicYearId: year.id, educationMediums: [medium] }));
