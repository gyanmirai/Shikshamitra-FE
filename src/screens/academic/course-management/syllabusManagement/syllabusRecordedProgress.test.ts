import { it, expect, describe } from 'vitest';

import { getChapterProgress, getSyllabusMetrics } from './syllabusPlanningData';

import type { IChapter } from './type';

const chapter: IChapter = {
  id: 'core-maths-one',
  chapterName: 'Core Maths ONE',
  chapterNumber: 1,
  chapterStartTime: '2026-09-10',
  chapterEndTime: '2026-09-15',
  description: '',
  standardId: 'class-12',
  subjectId: 'mathematics',
  creatorId: 'teacher',
  creationTime: '2026-09-08',
  lastModifierId: 'teacher',
  lastModificationTime: '2026-09-08',
};

describe('syllabus recorded progress', () => {
  it.each([
    ['2099-09-10', '2099-09-15'],
    ['2000-09-10', '2000-09-15'],
    ['10-09-2026', '15-09-2026'],
    ['', ''],
    ['invalid', 'invalid'],
  ])('preserves 15% diary progress regardless of schedule %s to %s', (start, end) => {
    expect(
      getChapterProgress({
        ...chapter,
        chapterStartTime: start,
        chapterEndTime: end,
        progressPercentage: 15,
      })
    ).toBe(15);
  });

  it.each([0, 15, 30, 100])('preserves recorded percentage %s', (progressPercentage) => {
    expect(getChapterProgress({ ...chapter, progressPercentage })).toBe(progressPercentage);
  });

  it.each([undefined, null, NaN, Infinity, -Infinity])(
    'uses zero for missing or invalid progress %s',
    (progressPercentage) => {
      const input = {
        ...chapter,
        chapterStartTime: '2000-01-01',
        chapterEndTime: '2000-01-02',
        progressPercentage,
      };
      expect(getChapterProgress(input as IChapter)).toBe(0);
    }
  );

  it.each([
    [-10, 0],
    [125, 100],
  ])('bounds malformed progress %s to %s', (progressPercentage, expected) => {
    expect(getChapterProgress({ ...chapter, progressPercentage })).toBe(expected);
  });

  it('uses the same recorded percentages in syllabus summaries', () => {
    const chapters = [
      { ...chapter, progressPercentage: 15, coverageStatus: 'In Progress' },
      { ...chapter, id: 'second', progressPercentage: 30, coverageStatus: 'In Progress' },
      { ...chapter, id: 'third', progressPercentage: 0, coverageStatus: 'Not Started' },
    ];
    expect(getSyllabusMetrics(chapters)).toMatchObject({
      totalChapters: 3,
      averageProgress: 15,
      completed: 0,
      inProgress: 2,
    });
    expect(getSyllabusMetrics([]).averageProgress).toBe(0);
  });
});
