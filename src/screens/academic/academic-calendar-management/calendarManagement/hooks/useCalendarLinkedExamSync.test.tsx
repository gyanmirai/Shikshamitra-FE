import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { calendarDayInitialValues } from '../initialValues';
import { useCalendarLinkedExamSync } from './useCalendarLinkedExamSync';

const selectedExam = { standardId: 'class-ten', examTypeId: 'oral' };
const schedule = {
  subjects: [
    {
      examDate: '2026-10-01T00:00:00+05:30',
      startTime: '2026-10-01T09:00:00+05:30',
      endTime: '2026-10-01T10:00:00+05:30',
    },
  ],
};

describe('linked calendar exam synchronization', () => {
  it('settles after setting the class and preserves title edits and persisted schedule', async () => {
    let renders = 0;
    const { result, rerender } = renderHook(() => {
      renders += 1;
      if (renders > 20) throw new Error('Linked exam synchronization did not settle');
      const formik = useFormik({
        initialValues: calendarDayInitialValues({
          linkedExamId: 'exam-one',
          date: '2026-10-02',
          examStartTime: '11:00:00',
          examEndTime: '12:00:00',
        }),
        onSubmit: () => {},
      });
      useCalendarLinkedExamSync({
        enabled: true,
        formik,
        selectedExam: { ...selectedExam },
        schedule,
        persistedLinkedExamId: 'exam-one',
      });
      return formik;
    });

    expect(result.current.values).toMatchObject({
      appliesToAll: false,
      standardIds: ['class-ten'],
      examTypeId: 'oral',
      date: '2026-10-02',
      examStartTime: '11:00:00',
      examEndTime: '12:00:00',
    });
    await act(async () => {
      await result.current.setFieldValue('title', 'Updated oral exam', false);
    });
    rerender();
    expect(result.current.values.title).toBe('Updated oral exam');
    expect(renders).toBeLessThan(20);
  });

  it('copies a newly linked schedule once and tolerates equivalent refetches', () => {
    const { result, rerender } = renderHook(
      ({ response }) => {
        const formik = useFormik({
          initialValues: calendarDayInitialValues({ linkedExamId: 'exam-two' }),
          onSubmit: () => {},
        });
        useCalendarLinkedExamSync({ enabled: true, formik, selectedExam, schedule: response });
        return formik;
      },
      { initialProps: { response: schedule } }
    );

    expect(result.current.values.date).toBe(schedule.subjects[0].examDate);
    expect(result.current.values.examStartTime).toBe(
      dayjs(schedule.subjects[0].startTime).format('HH:mm:ss')
    );
    expect(result.current.values.examEndTime).toBe(
      dayjs(schedule.subjects[0].endTime).format('HH:mm:ss')
    );
    const settledValues = result.current.values;
    rerender({ response: { subjects: [...schedule.subjects] } });
    expect(result.current.values).toBe(settledValues);
  });

  it('leaves a closed dialog untouched', () => {
    const initialValues = calendarDayInitialValues({ linkedExamId: 'exam-one' });
    const { result } = renderHook(() => {
      const formik = useFormik({ initialValues, onSubmit: () => {} });
      useCalendarLinkedExamSync({ enabled: false, formik, selectedExam, schedule });
      return formik;
    });
    expect(result.current.values).toEqual(initialValues);
    expect(result.current.dirty).toBe(false);
  });
});
