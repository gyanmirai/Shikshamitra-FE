import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import type { IChapter } from './type';

dayjs.extend(customParseFormat);

export const parseChapterDate = (dateStr?: string) => {
  if (!dateStr) return dayjs(null);
  const trimmed = String(dateStr).trim();
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(trimmed)) {
    const format = trimmed.includes('/') ? 'DD/MM/YYYY' : 'DD-MM-YYYY';
    const parsed = dayjs(trimmed, format);
    if (parsed.isValid()) return parsed;
  }
  const parsed = dayjs(trimmed);
  if (parsed.isValid()) return parsed;
  return dayjs(null);
};

export const syllabusTabs = [
  { value: 'overview', label: 'Overview', icon: 'mdi:view-dashboard-outline' },
  { value: 'chapters', label: 'Chapters', icon: 'mdi:book-open-page-variant-outline' },
  { value: 'timeline', label: 'Timeline', icon: 'mdi:timeline-clock-outline' },
  { value: 'resources', label: 'Resources', icon: 'mdi:folder-multiple-outline' },
  { value: 'questionBank', label: 'Question Bank', icon: 'mdi:comment-question-outline' },
  { value: 'coverage', label: 'Coverage Tracker', icon: 'mdi:chart-line' },
  { value: 'analytics', label: 'Analytics', icon: 'mdi:chart-box-outline' },
  { value: 'settings', label: 'Settings', icon: 'mdi:cog-outline' },
];

export const viewModes = [
  { value: 'table', label: 'Table', icon: 'mdi:table' },
  { value: 'timeline', label: 'Timeline', icon: 'mdi:timeline-outline' },
  { value: 'calendar', label: 'Calendar', icon: 'mdi:calendar-month-outline' },
  { value: 'unit', label: 'Unit', icon: 'mdi:layers-outline' },
  { value: 'coverage', label: 'Coverage', icon: 'mdi:progress-check' },
];

export const difficultyOptions = ['Easy', 'Medium', 'Hard'];
export const bloomOptions = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
export const publishStatusOptions = ['Draft', 'In Review', 'Published', 'Archived'];
export const reviewStatusOptions = ['Not Submitted', 'Submitted', 'Approved', 'Changes Requested'];
export const coverageStatusOptions = ['Not Started', 'In Progress', 'Completed', 'Delayed'];
export const mappingStatusOptions = ['Not Mapped', 'Mapped', 'Partially Mapped'];
export const resourceStatusOptions = ['Missing', 'Partial', 'Ready'];
export const visibilityOptions = ['Teacher', 'Students', 'Parents', 'All'];

export const statusColor = (status?: string) => {
  const normalized = (status || '').toLowerCase();
  if (
    normalized.includes('complete') ||
    normalized.includes('approved') ||
    normalized.includes('ready') ||
    normalized.includes('published') ||
    normalized.includes('linked') ||
    normalized === 'mapped'
  ) {
    return 'success';
  }
  if (
    normalized.includes('progress') ||
    normalized.includes('review') ||
    normalized.includes('partial')
  ) {
    return 'info';
  }
  if (
    normalized.includes('delay') ||
    normalized.includes('request') ||
    normalized.includes('missing')
  ) {
    return 'error';
  }
  if (normalized.includes('draft') || normalized.includes('not')) {
    return 'warning';
  }
  return 'default';
};

export const getChapterProgress = (chapter: IChapter) => {
  const start = parseChapterDate(chapter.chapterStartTime);
  const end = parseChapterDate(chapter.chapterEndTime);
  if (!start.isValid() || !end.isValid()) return 0;
  const totalDays = Math.max(end.diff(start, 'day'), 1);
  const elapsedDays = dayjs().diff(start, 'day');
  return Math.max(0, Math.min(100, Math.round((elapsedDays / totalDays) * 100)));
};

export const getCoverageStatus = (chapter: IChapter) => {
  if (chapter.coverageStatus) return chapter.coverageStatus;
  const progress = getChapterProgress(chapter);
  const end = parseChapterDate(chapter.chapterEndTime);
  if (progress >= 100) return 'Completed';
  if (end.isValid() && dayjs().isAfter(end) && progress < 100) return 'Delayed';
  if (progress > 0) return 'In Progress';
  return 'Not Started';
};

export const getSyllabusMetrics = (chapters: IChapter[]) => {
  const totalChapters = chapters.length;
  const plannedDuration = chapters.reduce((sum, chapter) => {
    if (chapter.estimatedTeachingDays) return sum + Number(chapter.estimatedTeachingDays);
    const start = parseChapterDate(chapter.chapterStartTime);
    const end = parseChapterDate(chapter.chapterEndTime);
    return start.isValid() && end.isValid() ? sum + Math.max(end.diff(start, 'day') + 1, 0) : sum;
  }, 0);
  const completed = chapters.filter((chapter) => getCoverageStatus(chapter) === 'Completed').length;
  const inProgress = chapters.filter(
    (chapter) => getCoverageStatus(chapter) === 'In Progress'
  ).length;
  const delayed = chapters.filter((chapter) => getCoverageStatus(chapter) === 'Delayed').length;
  const resourcesMissing = chapters.filter(
    (chapter) => !chapter.documents?.length && statusColor(chapter.resourceStatus) !== 'success'
  ).length;
  const assessmentMapped = chapters.filter(
    (chapter) => statusColor(chapter.assessmentStatus) === 'success'
  ).length;
  const lessonPlanLinked = chapters.filter(
    (chapter) => statusColor(chapter.lessonPlanStatus) === 'success'
  ).length;

  return {
    totalChapters,
    plannedDuration,
    completed,
    inProgress,
    delayed,
    resourcesMissing,
    assessmentMapped,
    lessonPlanLinked,
    averageProgress: totalChapters
      ? Math.round(
          chapters.reduce((sum, chapter) => sum + getChapterProgress(chapter), 0) / totalChapters
        )
      : 0,
  };
};
