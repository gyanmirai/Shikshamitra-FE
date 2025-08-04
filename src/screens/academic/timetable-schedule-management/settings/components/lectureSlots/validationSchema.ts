import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

const parseTime = (timeStr: string) => dayjs(timeStr, ['hh:mm A']);

export const getValidationSchema = (schoolStartTimeStr: string, schoolEndTimeStr: string) => {
  const schoolStart = parseTime(schoolStartTimeStr);
  const schoolEnd = parseTime(schoolEndTimeStr);

  return Yup.object().shape({
    className: Yup.string().required('Class is required'),
    totalSlots: Yup.number()
      .required('Total Slots are required')
      .min(1, 'At least one slot is required')
      .max(20, 'Maximum 20 slots can be added'),

    timeSlots: Yup.array()
      .of(
        Yup.object().shape({
          startTime: Yup.mixed()
            .required('Start time is required')
            .test('valid-start', 'Invalid start time', (value) =>
              value ? dayjs(value as Dayjs).isValid() : false
            )
            .test(
              'within-school-hours-start',
              'Start time must be within school hours',
              (value) => {
                const start = dayjs(value as Dayjs);
                return (
                  start.isValid() &&
                  start.isSameOrAfter(schoolStart, 'minute') &&
                  start.isBefore(schoolEnd, 'minute')
                );
              }
            ),

          endTime: Yup.mixed()
            .required('End time is required')
            .test('valid-end', 'Invalid end time', (value) =>
              value ? dayjs(value as Dayjs).isValid() : false
            )
            .test('within-school-hours-end', 'End time must be within school hours', (value) => {
              const end = dayjs(value as Dayjs);
              return (
                end.isValid() &&
                end.isAfter(schoolStart, 'minute') &&
                end.isSameOrBefore(schoolEnd, 'minute')
              );
            })
            .test('after-start', 'End time must be after start time', function (endTime) {
              const { startTime } = this.parent;
              if (!startTime || !endTime) return true;
              const start = dayjs(startTime);
              const end = dayjs(endTime as Dayjs);
              return start.isValid() && end.isValid() && end.isAfter(start);
            }),

          slotType: Yup.string().required('Slot type is required'),

          breakType: Yup.string().when('slotType', {
            is: 'break',
            then: (schema) => schema.required('Break type is required'),
            otherwise: (schema) => schema.notRequired(),
          }),
        })
      )
      .min(1, 'Please create at least one time slot')
      .test(
        'sequential-slots',
        'Time slots must be sequential without gaps or overlap',
        function (slots) {
          if (!slots || slots.length <= 1) return true;

          const sorted = slots.map((slot, index) => ({
            index,
            start: dayjs(slot.startTime as Dayjs),
            end: dayjs(slot.endTime as Dayjs),
          }));

          for (let i = 0; i < sorted.length - 1; i += 1) {
            const current = sorted[i];
            const next = sorted[i + 1];

            if (
              !current.start.isValid() ||
              !current.end.isValid() ||
              !next.start.isValid() ||
              !next.end.isValid()
            ) {
              return true;
            }

            if (!current.end.isSame(next.start)) {
              return this.createError({
                path: `timeSlots[${next.index}].startTime`,
                message: `Slot ${next.index + 1} must start exactly when slot ${
                  current.index + 1
                } ends`,
              });
            }
          }
          return true;
        }
      ),
  });
};
