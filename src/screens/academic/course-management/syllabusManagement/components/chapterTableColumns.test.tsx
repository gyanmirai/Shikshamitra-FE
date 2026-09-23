import { it, expect, describe } from 'vitest';

import { getChapterTableColumns } from './chapterTableColumns';

describe('syllabus chapter table columns', () => {
  it('keeps the table focused on the requested chapter information', () => {
    const columnIds = getChapterTableColumns(() => []).map((column) => column.id);

    expect(columnIds).toEqual([
      'chapterName',
      'chapterStartTime',
      'chapterEndTime',
      'plannedLoad',
      'lessonPlanStatus',
      'homeworkStatus',
      'description',
      'progressPercentage',
      'actions',
    ]);
    expect(columnIds).not.toEqual(
      expect.arrayContaining(['unitTerm', 'outcomes', 'resources', 'questionCount'])
    );
  });
});
