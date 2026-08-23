import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';

import {
  isExamOngoing,
  getEffectiveExamStatus,
  filterExamsByEffectiveStatus,
} from './scheduleExamStatus';

describe('scheduleExamStatus', () => {
  it('treats a published date-only exam as ongoing for the full scheduled day', () => {
    const exam = {
      status: examScheduledStatus.Published,
      startDate: '2026-08-18',
      endDate: '2026-08-18',
    };

    expect(isExamOngoing(exam, dayjs('2026-08-18T12:00:00'))).toBe(true);
    expect(isExamOngoing(exam, dayjs('2026-08-19T00:00:00'))).toBe(false);
  });

  it('uses exact date-time boundaries when the API provides them', () => {
    const exam = {
      status: examScheduledStatus.Published,
      startDateTime: '2026-08-18T09:00:00+05:30',
      endDateTime: '2026-08-18T12:00:00+05:30',
    };

    expect(isExamOngoing(exam, dayjs('2026-08-18T08:59:59+05:30'))).toBe(false);
    expect(isExamOngoing(exam, dayjs('2026-08-18T10:30:00+05:30'))).toBe(true);
    expect(isExamOngoing(exam, dayjs('2026-08-18T12:00:01+05:30'))).toBe(false);
  });

  it('combines date fields with separate wall-clock time fields', () => {
    const exam = {
      status: examScheduledStatus.Published,
      startDate: '2026-08-18',
      endDate: '2026-08-18',
      startTime: '09:00:00',
      endTime: '12:00:00',
    };

    expect(isExamOngoing(exam, dayjs('2026-08-18T10:00:00'))).toBe(true);
    expect(isExamOngoing(exam, dayjs('2026-08-18T13:00:00'))).toBe(false);
  });

  it('uses subject schedule times when the exam window is returned per subject', () => {
    const exam = {
      status: examScheduledStatus.Published,
      subjects: [
        {
          examDate: '2026-08-18',
          startTime: '11:00:00',
          endTime: '11:40:00',
        },
      ],
    };

    expect(isExamOngoing(exam, dayjs('2026-08-18T10:00:00'))).toBe(false);
    expect(isExamOngoing(exam, dayjs('2026-08-18T11:00:00'))).toBe(true);
    expect(isExamOngoing(exam, dayjs('2026-08-18T11:40:01'))).toBe(false);
  });

  it('never derives ongoing from a non-published lifecycle status', () => {
    expect(
      getEffectiveExamStatus(
        {
          status: examScheduledStatus.Completed,
          startDate: '2026-08-18',
          endDate: '2026-08-18',
        },
        dayjs('2026-08-18T10:00:00')
      )
    ).toBe(examScheduledStatus.Completed);
  });

  it('separates upcoming published exams from ongoing exams', () => {
    const exams = [
      {
        status: examScheduledStatus.Published,
        startDate: '2026-08-18',
        endDate: '2026-08-18',
      },
      {
        status: examScheduledStatus.Published,
        startDate: '2026-08-20',
        endDate: '2026-08-20',
      },
    ];
    const now = dayjs('2026-08-18T10:00:00');

    expect(filterExamsByEffectiveStatus(exams, examScheduledStatus.Ongoing, now)).toHaveLength(1);
    expect(filterExamsByEffectiveStatus(exams, examScheduledStatus.Published, now)).toHaveLength(1);
  });

  it('moves a published exam to Completed after its final scheduled date', () => {
    const exam = {
      status: examScheduledStatus.Published,
      startDate: '2026-08-18',
      endDate: '2026-08-18',
    };

    expect(getEffectiveExamStatus(exam, dayjs('2026-08-19T09:00:00'))).toBe(
      examScheduledStatus.Completed
    );
  });
});
