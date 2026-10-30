import dayjs from 'dayjs';
import { it, expect, describe } from 'vitest';

import { serializeHomeworkFormData } from './homework-serialization';

describe('homework FormData serialization', () => {
  it('keeps the selected midnight date in IST with an explicit offset', () => {
    const body = serializeHomeworkFormData({
      standardId: 'class',
      subjectId: 'subject',
      title: 'Revision',
      homeworkTypeId: 'revision',
      submissionType: 0,
      divisions: [
        {
          divisionId: 'A',
          publishDate: dayjs('2026-10-29T17:36:00'),
          dueDate: dayjs('2026-10-30T00:00:00'),
        },
      ],
    });
    expect(body.get('DivisionSchedules[0].DueAt')).toBe('2026-10-30T00:00:00+05:30');
    expect(body.get('DivisionSchedules[0].PublishAt')).toBe('2026-10-29T17:36:00+05:30');
  });
  it('serializes the Homework DTO fields, not Assignment DTO fields', () => {
    const formData = serializeHomeworkFormData({
      standardId: 'standard-1',
      subjectId: 'subject-1',
      chapterIds: ['chapter-1', 'chapter-2'],
      title: '  Read chapter 1  ',
      description: 'Read and summarize the chapter.',
      homeworkTypeId: 'homework-type-1',
      submissionType: 3,
      divisions: [
        {
          divisionId: 'division-1',
          publishDate: dayjs('2026-08-25T09:00:00.000Z'),
          dueDate: dayjs('2026-08-26T09:00:00.000Z'),
        },
      ],
    });

    expect(formData.get('HomeworkTypeId')).toBe('homework-type-1');
    expect(formData.get('SubmissionType')).toBe('3');
    expect(formData.getAll('ChapterIds')).toEqual(['chapter-1', 'chapter-2']);
    expect(formData.get('ChapterId')).toBe('chapter-1');
    expect(formData.has('AssignmentTypeId')).toBe(false);
    expect(formData.get('DivisionSchedules[0].DivisionId')).toBe('division-1');
    expect(formData.has('DivisionSchedules[0].PublishAt')).toBe(true);
    expect(formData.has('DivisionSchedules[0].DueAt')).toBe(true);
  });
});
