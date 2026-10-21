import { it, expect, describe } from 'vitest';

import { changeReportFilter } from './components/report-filters';

describe('Institute report filter dependencies', () => {
  it('clears stale descendants when the academic year changes', () => {
    expect(changeReportFilter({ academicYearId: 'old', boardId: 'b', mediumId: 'm', stageId: 's', standardId: 'c', divisionId: 'd' }, 'academicYearId', 'new'))
      .toEqual({ academicYearId: 'new' });
  });
  it('keeps ancestors and clears class/division selections when stage changes', () => {
    expect(changeReportFilter({ academicYearId: 'year', mediumId: 'medium', stageId: 'old', standardId: 'class', divisionId: 'division' }, 'stageId', 'new'))
      .toEqual({ academicYearId: 'year', mediumId: 'medium', stageId: 'new' });
  });
  it('clears a floor when its building changes and preserves the room type', () => {
    expect(changeReportFilter({ buildingId: 'old', floorId: 'floor', roomTypeId: 'type' }, 'buildingId', 'new'))
      .toEqual({ buildingId: 'new', roomTypeId: 'type' });
  });
  it('preserves metadata filters while academic descendants reset', () => {
    expect(changeReportFilter({ identityScope: 'medium', academicYearId: 'old', boardId: 'b', mediumId: 'm', stageId: 'o' }, 'academicYearId', 'new'))
      .toEqual({ identityScope: 'medium', academicYearId: 'new' });
  });
});
