import dayjs from 'dayjs';

import { getCoverageStatus, getChapterProgress } from '../syllabusPlanningData';

import type { IChapter } from '../type';

export function buildChapterTableRows(data: IChapter[]) {
  return data.map((chapter) => ({
    ...chapter,
    chapterStartTime: chapter.chapterStartTime
      ? dayjs(chapter.chapterStartTime).format('DD-MM-YYYY')
      : '',
    chapterEndTime: chapter.chapterEndTime
      ? dayjs(chapter.chapterEndTime).format('DD-MM-YYYY')
      : '',
    plannedLoad: `${chapter.estimatedTeachingDays || '-'} days / ${
      chapter.estimatedPeriods || '-'
    } periods`,
    lessonPlanStatus: chapter.lessonPlanStatus || 'Not Linked',
    homeworkStatus: chapter.homeworkStatus || 'Not Mapped',
    assessmentStatus: chapter.assessmentStatus || 'Not Mapped',
    progressPercentage: getChapterProgress(chapter),
    coverageStatus: getCoverageStatus(chapter),
    publishStatus: chapter.publishStatus || 'Draft',
    descriptionHtml: chapter.description || '',
    description: chapter.description ? chapter.description.replace(/<[^>]*>/g, '') : '',
  }));
}
