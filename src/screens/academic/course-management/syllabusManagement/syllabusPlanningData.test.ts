import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import {
  statusColor,
  getChapterProgress,
  getCoverageStatus,
  getSyllabusMetrics,
} from './syllabusPlanningData';

import type { IChapter } from './type';

describe('syllabusPlanningData - getChapterProgress and getCoverageStatus', () => {
  it('does not use static progressPercentage and returns 0 for future chapters', () => {
    const futureChapter: IChapter = {
      id: '1',
      chapterName: 'Basics of CHE',
      chapterNumber: 1,
      chapterStartTime: dayjs().add(5, 'day').format('YYYY-MM-DD'),
      chapterEndTime: dayjs().add(15, 'day').format('YYYY-MM-DD'),
      description: 'Chemistry',
      standardId: 'std-1',
      subjectId: 'sub-1',
      creatorId: 'u-1',
      creationTime: '2026-08-01',
      lastModifierId: 'u-1',
      lastModificationTime: '2026-08-01',
      progressPercentage: 30, // static metadata from legacy input
    };

    // Should decouple and evaluate to 0 because the chapter has not started yet
    expect(getChapterProgress(futureChapter)).toBe(0);
    expect(getCoverageStatus(futureChapter)).toBe('Not Started');
  });

  it('handles chapters with DD-MM-YYYY format strings', () => {
    const futureChapter: IChapter = {
      id: '2',
      chapterName: 'Organic Chem',
      chapterNumber: 2,
      chapterStartTime: dayjs().add(10, 'day').format('DD-MM-YYYY'),
      chapterEndTime: dayjs().add(20, 'day').format('DD-MM-YYYY'),
      description: 'Organic',
      standardId: 'std-1',
      subjectId: 'sub-1',
      creatorId: 'u-1',
      creationTime: '2026-08-01',
      lastModifierId: 'u-1',
      lastModificationTime: '2026-08-01',
      progressPercentage: 50,
    };

    expect(getChapterProgress(futureChapter)).toBe(0);
    expect(getCoverageStatus(futureChapter)).toBe('Not Started');
  });

  it('calculates progress correctly for currently active chapters', () => {
    const activeChapter: IChapter = {
      id: '3',
      chapterName: 'Active Chapter',
      chapterNumber: 3,
      chapterStartTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
      chapterEndTime: dayjs().add(5, 'day').format('YYYY-MM-DD'),
      description: 'Active',
      standardId: 'std-1',
      subjectId: 'sub-1',
      creatorId: 'u-1',
      creationTime: '2026-08-01',
      lastModifierId: 'u-1',
      lastModificationTime: '2026-08-01',
    };

    const progress = getChapterProgress(activeChapter);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(100);
    expect(getCoverageStatus(activeChapter)).toBe('In Progress');
  });

  it('evaluates status color correctly', () => {
    expect(statusColor('Completed')).toBe('success');
    expect(statusColor('In Progress')).toBe('info');
    expect(statusColor('Delayed')).toBe('error');
    expect(statusColor('Not Started')).toBe('warning');
  });

  it('computes syllabus metrics properly', () => {
    const chapters: IChapter[] = [
      {
        id: '1',
        chapterName: 'Ch 1',
        chapterNumber: 1,
        chapterStartTime: dayjs().add(5, 'day').format('YYYY-MM-DD'),
        chapterEndTime: dayjs().add(10, 'day').format('YYYY-MM-DD'),
        description: 'Ch 1',
        standardId: 'std-1',
        subjectId: 'sub-1',
        creatorId: 'u-1',
        creationTime: '2026-08-01',
        lastModifierId: 'u-1',
        lastModificationTime: '2026-08-01',
      },
    ];

    const metrics = getSyllabusMetrics(chapters);
    expect(metrics.totalChapters).toBe(1);
    expect(metrics.averageProgress).toBe(0);
  });
});
