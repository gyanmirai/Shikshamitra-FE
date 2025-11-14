import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

const parseTime = (timeString: string): Dayjs => dayjs(timeString, 'hh:mm A');

export const getValidationSchema = (schoolStartTimeStr: string, schoolEndTimeStr: string) => {
  const schoolStart = parseTime(schoolStartTimeStr);
  const schoolEnd = parseTime(schoolEndTimeStr);

  if (!schoolStart.isValid() || !schoolEnd.isValid()) {
    throw new Error('Invalid school hours provided');
  }

  return Yup.object().shape({
    className: Yup.string().required('Class is required'),
    schoolHours: Yup.string().required('School hours is required'),
    previousClassSlots: Yup.string(),

    slotConfigurations: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required(),

          totalSlots: Yup.string()
            .required('Total slots is required')
            .test('valid-number', 'Must be between 1 and 20', (value) => {
              if (!value) return false;
              const num = parseInt(value, 10);
              return !Number.isNaN(num) && num >= 1 && num <= 20;
            }),

          weekRange: Yup.array()
            .of(Yup.number())
            .length(2, 'Week range must have 2 values')
            .required('Week range is required'),

          expanded: Yup.boolean(),

          timeSlots: Yup.array()
            .of(
              Yup.object().shape({
                id: Yup.string().required(),

                startTime: Yup.mixed()
                  .required('Start time is required')
                  .test('valid-start', 'Invalid start time', (value) =>
                    value ? dayjs(value as Dayjs).isValid() : false
                  )
                  .test(
                    'within-school-hours-start',
                    'Start time must be within school hours',
                    (value) => {
                      if (!value) return false;
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
                  .test(
                    'within-school-hours-end',
                    'End time must be within school hours',
                    (value) => {
                      if (!value) return false;
                      const end = dayjs(value as Dayjs);
                      return (
                        end.isValid() &&
                        end.isAfter(schoolStart, 'minute') &&
                        end.isSameOrBefore(schoolEnd, 'minute')
                      );
                    }
                  )
                  .test('after-start', 'End time must be after start time', function (endTime) {
                    const { startTime } = this.parent;
                    if (!startTime || !endTime) return true;
                    const start = dayjs(startTime);
                    const end = dayjs(endTime as Dayjs);
                    return start.isValid() && end.isValid() && end.isAfter(start);
                  }),

                slotType: Yup.string()
                  .required('Slot type is required')
                  .oneOf(['period', 'break'], 'Invalid slot type'),

                breakType: Yup.string().when('slotType', {
                  is: 'break',
                  then: (schema) => schema.required('Break type is required'),
                  otherwise: (schema) => schema.notRequired(),
                }),
              })
            )
            .min(1, 'At least one time slot is required')
            .test(
              'sequential-slots',
              'Time slots must be sequential without gaps or overlap',
              function (slots) {
                if (!slots || slots.length <= 1) return true;

                for (let i = 0; i < slots.length - 1; i += 1) {
                  const current = slots[i];
                  const next = slots[i + 1];

                  const currentEnd = dayjs(current.endTime as Dayjs);
                  const nextStart = dayjs(next.startTime as Dayjs);

                  if (!currentEnd.isValid() || !nextStart.isValid()) {
                    // eslint-disable-next-line no-continue
                    continue;
                  }

                  if (!currentEnd.isSame(nextStart, 'minute')) {
                    return this.createError({
                      path: `timeSlots[${i + 1}].startTime`,
                      message: `Slot ${i + 2} must start exactly when slot ${i + 1} ends`,
                    });
                  }
                }
                return true;
              }
            ),
        })
      )
      .min(1, 'At least one slot configuration is required'),
  });
};
