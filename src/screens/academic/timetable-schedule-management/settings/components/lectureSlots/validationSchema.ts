import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

const parseTime = (timeString: string): Dayjs => dayjs(timeString, 'hh:mm A');

// Helper function to parse school hours string
const parseSchoolHours = (schoolHours: string) => {
  const match = schoolHours.match(/(\d{2}:\d{2}\s[AP]M)\s*-\s*(\d{2}:\d{2}\s[AP]M)/);
  if (!match) return null;
  return {
    start: parseTime(match[1]),
    end: parseTime(match[2]),
  };
};

export const getValidationSchema = (schoolStartTimeStr: string, schoolEndTimeStr: string) => {
  const schoolStart = parseTime(schoolStartTimeStr);
  const schoolEnd = parseTime(schoolEndTimeStr);

  if (!schoolStart.isValid() || !schoolEnd.isValid()) {
    throw new Error('Invalid school hours provided');
  }

  const schoolDurationMinutes = schoolEnd.diff(schoolStart, 'minute');

  return Yup.object().shape({
    // ============ GENERAL INFORMATION VALIDATIONS ============
    className: Yup.string().required('Class is required').min(1, 'Class name cannot be empty'),

    schoolHours: Yup.string()
      .required('School hours is required')
      .test('valid-format', 'Invalid format. Use "HH:MM AM/PM - HH:MM AM/PM"', (value) => {
        if (!value) return false;
        const parsed = parseSchoolHours(value);
        return parsed !== null;
      })
      .test('valid-duration', 'School hours must be at least 2 hours', (value) => {
        if (!value) return false;
        const parsed = parseSchoolHours(value);
        if (!parsed) return false;
        const duration = parsed.end.diff(parsed.start, 'minute');
        return duration >= 120; // At least 2 hours
      })
      .test('logical-time', 'End time must be after start time', (value) => {
        if (!value) return false;
        const parsed = parseSchoolHours(value);
        if (!parsed) return false;
        return parsed.end.isAfter(parsed.start);
      }),

    previousClassSlots: Yup.string().test(
      'not-same-as-current',
      'Cannot copy slots from the same class',
      // eslint-disable-next-line func-names
      function (value) {
        if (!value) return true; // Optional field
        const { className } = this.parent;
        return value !== className;
      }
    ),

    // ============ SLOT CONFIGURATIONS VALIDATIONS ============
    slotConfigurations: Yup.array()
      .of(
        Yup.object().shape({
          id: Yup.string().required(),

          // Total Slots Validation
          totalSlots: Yup.string()
            .required('Total slots is required')
            .test('valid-number', 'Must be between 1 and 20', (value) => {
              if (!value) return false;
              const num = parseInt(value, 10);
              return !Number.isNaN(num) && num >= 1 && num <= 20;
            })
            .test(
              'matches-time-slots',
              'Total slots must match the number of time slots created',
              // eslint-disable-next-line func-names
              function (value) {
                const { timeSlots } = this.parent;
                if (!value || !timeSlots) return true;
                const num = parseInt(value, 10);
                return num === timeSlots.length;
              }
            )
            .test(
              'realistic-duration',
              'Too many slots for the school hours duration',
              // eslint-disable-next-line func-names
              (value) => {
                if (!value) return false;
                const num = parseInt(value, 10);
                // Minimum 5 minutes per slot
                const minRequiredMinutes = num * 5;
                return minRequiredMinutes <= schoolDurationMinutes;
              }
            ),

          // Week Range Validation
          weekRange: Yup.array()
            .of(Yup.number())
            .length(2, 'Week range must have 2 values')
            .required('Week range is required')
            .test('valid-range', 'Start day must be before or equal to end day', (value) => {
              if (!value || value.length !== 2) return false;
              const [start, end] = value as [number, number];
              return start <= end;
            })
            .test('within-bounds', 'Days must be between Monday (0) and Saturday (5)', (value) => {
              if (!value || value.length !== 2) return false;
              const [start, end] = value as [number, number];
              return start >= 0 && start <= 5 && end >= 0 && end <= 5;
            })
            .test('at-least-one-day', 'At least one day must be selected', (value) => {
              if (!value || value.length !== 2) return false;
              const [start, end] = value as [number, number];
              return end >= start; // Ensures at least one day
            }),

          expanded: Yup.boolean(),

          // ============ TIME SLOTS VALIDATIONS ============
          timeSlots: Yup.array()
            .of(
              Yup.object().shape({
                id: Yup.string().required(),

                // Start Time Validation
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

                // End Time Validation
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
                  .test(
                    'after-start',
                    'End time must be after start time',
                    // eslint-disable-next-line func-names
                    function (endTime) {
                      const { startTime } = this.parent;
                      if (!startTime || !endTime) return true;
                      const start = dayjs(startTime);
                      const end = dayjs(endTime as Dayjs);
                      return start.isValid() && end.isValid() && end.isAfter(start);
                    }
                  )
                  .test(
                    'minimum-duration',
                    'Slot duration must be at least 5 minutes',
                    // eslint-disable-next-line func-names
                    function (endTime) {
                      const { startTime } = this.parent;
                      if (!startTime || !endTime) return true;
                      const start = dayjs(startTime);
                      const end = dayjs(endTime as Dayjs);
                      const duration = end.diff(start, 'minute');
                      return duration >= 5;
                    }
                  )
                  .test(
                    'maximum-duration',
                    'Single slot cannot exceed 3 hours',
                    // eslint-disable-next-line func-names
                    function (endTime) {
                      const { startTime } = this.parent;
                      if (!startTime || !endTime) return true;
                      const start = dayjs(startTime);
                      const end = dayjs(endTime as Dayjs);
                      const duration = end.diff(start, 'minute');
                      return duration <= 180; // 3 hours max
                    }
                  ),

                // Slot Type Validation
                slotType: Yup.string()
                  .required('Slot type is required')
                  .oneOf(['period', 'break'], 'Invalid slot type'),

                // Break Type Validation
                breakType: Yup.string()
                  // eslint-disable-next-line func-names
                  .when('slotType', {
                    is: 'break',
                    then: (schema) =>
                      schema
                        .required('Break type is required when slot type is break')
                        .oneOf(['short', 'lunch'], 'Invalid break type'),
                    otherwise: (schema) => schema.notRequired(),
                  })
                  .test(
                    'break-duration-short',
                    'Short break should be 5-20 minutes',
                    // eslint-disable-next-line func-names
                    function (value) {
                      const { slotType, startTime, endTime } = this.parent;
                      if (slotType !== 'break' || value !== 'short') return true;
                      if (!startTime || !endTime) return true;
                      const duration = dayjs(endTime).diff(dayjs(startTime), 'minute');
                      return duration >= 5 && duration <= 20;
                    }
                  )
                  .test(
                    'break-duration-lunch',
                    'Lunch break should be 20-60 minutes',
                    // eslint-disable-next-line func-names
                    function (value) {
                      const { slotType, startTime, endTime } = this.parent;
                      if (slotType !== 'break' || value !== 'lunch') return true;
                      if (!startTime || !endTime) return true;
                      const duration = dayjs(endTime).diff(dayjs(startTime), 'minute');
                      return duration >= 20 && duration <= 60;
                    }
                  ),
              })
            )
            .min(1, 'At least one time slot is required')
            // Sequential Slots Validation
            .test(
              'sequential-slots',
              'Time slots must be sequential without gaps or overlap',
              // eslint-disable-next-line func-names
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
            )
            // First and Last Slot Validation
            .test(
              'first-last-period',
              'First and last slots should be periods, not breaks',
              // eslint-disable-next-line func-names
              function (slots) {
                if (!slots || slots.length === 0) return true;
                const firstSlot = slots[0];
                const lastSlot = slots[slots.length - 1];

                if (firstSlot.slotType === 'break') {
                  return this.createError({
                    path: 'timeSlots[0].slotType',
                    message: 'First slot should be a period, not a break',
                  });
                }

                if (lastSlot.slotType === 'break') {
                  return this.createError({
                    path: `timeSlots[${slots.length - 1}].slotType`,
                    message: 'Last slot should be a period, not a break',
                  });
                }

                return true;
              }
            )
            // Minimum Periods Validation
            .test(
              'minimum-periods',
              'At least 3 periods are required',
              // eslint-disable-next-line func-names
              function (slots) {
                if (!slots) return false;
                const periodCount = slots.filter((slot) => slot.slotType === 'period').length;
                if (periodCount < 3) {
                  return this.createError({
                    message: 'At least 3 periods are required in the schedule',
                  });
                }
                return true;
              }
            )
            // Maximum Consecutive Breaks
            .test(
              'max-consecutive-breaks',
              'No more than 2 consecutive breaks allowed',
              // eslint-disable-next-line func-names
              function (slots) {
                if (!slots || slots.length <= 2) return true;

                let consecutiveBreaks = 0;
                for (let i = 0; i < slots.length; i += 1) {
                  if (slots[i].slotType === 'break') {
                    consecutiveBreaks += 1;
                    if (consecutiveBreaks > 2) {
                      return this.createError({
                        path: `timeSlots[${i}].slotType`,
                        message: 'No more than 2 consecutive breaks allowed',
                      });
                    }
                  } else {
                    consecutiveBreaks = 0;
                  }
                }
                return true;
              }
            )
            // Single Lunch Break Validation
            .test(
              'single-lunch-break',
              'Only one lunch break is allowed per configuration',
              // eslint-disable-next-line func-names
              function (slots) {
                if (!slots) return true;
                const lunchBreaks = slots.filter(
                  (slot) => slot.slotType === 'break' && slot.breakType === 'lunch'
                );
                if (lunchBreaks.length > 1) {
                  return this.createError({
                    message: 'Only one lunch break is allowed per slot configuration',
                  });
                }
                return true;
              }
            )
            // Minimum Teaching Time (60% of school hours should be periods)
            .test(
              'minimum-teaching-time',
              'At least 60% of school hours should be teaching periods',
              // eslint-disable-next-line func-names
              function (slots) {
                if (!slots || slots.length === 0) return true;

                let totalPeriodMinutes = 0;
                let totalBreakMinutes = 0;

                slots.forEach((slot) => {
                  const duration = dayjs(slot.endTime as Dayjs).diff(
                    dayjs(slot.startTime as Dayjs),
                    'minute'
                  );
                  if (slot.slotType === 'period') {
                    totalPeriodMinutes += duration;
                  } else {
                    totalBreakMinutes += duration;
                  }
                });

                const totalMinutes = totalPeriodMinutes + totalBreakMinutes;
                const periodPercentage = (totalPeriodMinutes / totalMinutes) * 100;

                if (periodPercentage < 60) {
                  return this.createError({
                    message: `Teaching time is only ${periodPercentage.toFixed(1)}%. At least 60% required.`,
                  });
                }

                return true;
              }
            )
            // Total Time Coverage
            .test(
              'time-coverage',
              'Slots should cover the entire school hours',
              // eslint-disable-next-line func-names
              function (slots) {
                if (!slots || slots.length === 0) return true;

                const firstSlotStart = dayjs(slots[0].startTime as Dayjs);
                const lastSlotEnd = dayjs(slots[slots.length - 1].endTime as Dayjs);

                // Allow 15 minutes tolerance
                const startDiff = Math.abs(firstSlotStart.diff(schoolStart, 'minute'));
                const endDiff = Math.abs(lastSlotEnd.diff(schoolEnd, 'minute'));

                if (startDiff > 15) {
                  return this.createError({
                    path: 'timeSlots[0].startTime',
                    message: 'First slot should start close to school start time',
                  });
                }

                if (endDiff > 15) {
                  return this.createError({
                    path: `timeSlots[${slots.length - 1}].endTime`,
                    message: 'Last slot should end close to school end time',
                  });
                }

                return true;
              }
            ),
        })
      )
      .min(1, 'At least one slot configuration is required')
      // Cross-Configuration Validation: No Overlapping Week Ranges
      .test(
        'no-overlapping-weeks',
        'Week ranges across configurations should not overlap',
        // eslint-disable-next-line func-names
        function (configs) {
          if (!configs || configs.length <= 1) return true;

          for (let i = 0; i < configs.length; i += 1) {
            for (let j = i + 1; j < configs.length; j += 1) {
              const range1 = configs[i].weekRange as [number, number] | undefined;
              const range2 = configs[j].weekRange as [number, number] | undefined;

              if (!range1 || !range2 || range1.length !== 2 || range2.length !== 2) {
                // eslint-disable-next-line no-continue
                continue;
              }

              // Check if ranges overlap
              const [r1Start, r1End] = range1;
              const [r2Start, r2End] = range2;
              const overlap =
                (r1Start <= r2End && r1End >= r2Start) || (r2Start <= r1End && r2End >= r1Start);

              if (overlap) {
                return this.createError({
                  path: `slotConfigurations[${j}].weekRange`,
                  message: `Week range overlaps with configuration ${i + 1}`,
                });
              }
            }
          }
          return true;
        }
      ),
  });
};
