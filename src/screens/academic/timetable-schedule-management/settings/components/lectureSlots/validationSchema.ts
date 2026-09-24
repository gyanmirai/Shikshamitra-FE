import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import * as Yup from 'yup';

// Convert any dayjs value to minutes-of-day
const toMinutesOfDay = (value: unknown): number | null => {
  const d = dayjs(value as Dayjs);
  if (!d.isValid()) return null;
  return d.hour() * 60 + d.minute();
};

export const getValidationSchema = () =>
  Yup.object().shape({
    // ============ GENERAL INFORMATION VALIDATIONS ============
    className: Yup.string().required('Class is required').min(1, 'Class name cannot be empty'),
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
            }),

          // Active Days Validation
          weekRange: Yup.array()
            .of(Yup.number())
            .min(1, 'Select at least one active day')
            .max(6, 'A maximum of 6 active days can be selected')
            .required('Active days are required')
            .test('within-bounds', 'Days must be between Monday (0) and Saturday (5)', (value) => {
              if (!value) return false;
              return value.every((day) => day !== undefined && day >= 0 && day <= 5);
            })
            .test('unique-days', 'Each active day can only be selected once', (value) => {
              if (!value) return false;
              return new Set(value).size === value.length;
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
                  ),

                // End Time Validation
                endTime: Yup.mixed()
                  .required('End time is required')
                  .test('valid-end', 'Invalid end time', (value) =>
                    value ? dayjs(value as Dayjs).isValid() : false
                  )
                  .test(
                    'after-start',
                    'End time must be after start time',
                    // eslint-disable-next-line func-names
                    function (endTime) {
                      const { startTime } = this.parent;
                      if (!startTime || !endTime) return true;
                      const startMin = toMinutesOfDay(startTime);
                      const endMin = toMinutesOfDay(endTime);
                      if (startMin == null || endMin == null) return true;
                      return endMin > startMin;
                    }
                  )
                  .test(
                    'minimum-duration',
                    'Slot duration must be at least 5 minutes',
                    // eslint-disable-next-line func-names
                    function (endTime) {
                      const { startTime } = this.parent;
                      if (!startTime || !endTime) return true;
                      const startMin = toMinutesOfDay(startTime);
                      const endMin = toMinutesOfDay(endTime);
                      if (startMin == null || endMin == null) return true;
                      return endMin - startMin >= 5;
                    }
                  )
                  .test(
                    'maximum-duration',
                    'Single slot cannot exceed 3 hours',
                    // eslint-disable-next-line func-names
                    function (endTime) {
                      const { startTime } = this.parent;
                      if (!startTime || !endTime) return true;
                      const startMin = toMinutesOfDay(startTime);
                      const endMin = toMinutesOfDay(endTime);
                      if (startMin == null || endMin == null) return true;
                      return endMin - startMin <= 180;
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
                        .oneOf(['short'], 'Invalid break type'),
                    otherwise: (schema) => schema.notRequired(),
                  }),
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

                  const currentEndMin = toMinutesOfDay(current.endTime);
                  const nextStartMin = toMinutesOfDay(next.startTime);

                  if (currentEndMin == null || nextStartMin == null) {
                    // eslint-disable-next-line no-continue
                    continue;
                  }

                  if (currentEndMin !== nextStartMin) {
                    return this.createError({
                      path: `${this.path}[${i + 1}].startTime`,
                      message: `must start exactly when slot ${i + 1} ends`,
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
                    path: `${this.path}[0].slotType`,
                    message: 'First slot should be a period, not a break',
                  });
                }

                if (lastSlot.slotType === 'break') {
                  return this.createError({
                    path: `${this.path}[${slots.length - 1}].slotType`,
                    message: 'Last slot should be a period, not a break',
                  });
                }

                return true;
              }
            )
            // Minimum Slots Validation
            .test(
              'minimum-slots',
              'At least 3 slots are required',
              // eslint-disable-next-line func-names
              function (slots) {
                if (!slots) return false;
                if (slots.length < 3) {
                  return this.createError({
                    message: 'At least 3 slots are required in the schedule',
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
                        path: `${this.path}[${i}].slotType`,
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
                  const startMin = toMinutesOfDay(slot.startTime);
                  const endMin = toMinutesOfDay(slot.endTime);
                  if (startMin == null || endMin == null) return;
                  const duration = endMin - startMin;
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
            ),
        })
      )
      .min(1, 'At least one slot configuration is required')
      // Cross-Configuration Validation: No Overlapping Active Days
      .test(
        'no-overlapping-weeks',
        'Active days across configurations should not overlap',
        // eslint-disable-next-line func-names
        function (configs) {
          if (!configs || configs.length <= 1) return true;

          for (let i = 0; i < configs.length; i += 1) {
            for (let j = i + 1; j < configs.length; j += 1) {
              const days1 = configs[i].weekRange as number[] | undefined;
              const days2 = configs[j].weekRange as number[] | undefined;

              if (!days1?.length || !days2?.length) {
                // eslint-disable-next-line no-continue
                continue;
              }

              const overlap = days1.some((day) => days2.includes(day));

              if (overlap) {
                return this.createError({
                  path: `slotConfigurations[${j}].weekRange`,
                  message: `Active days overlap with configuration ${i + 1}`,
                });
              }
            }
          }
          return true;
        }
      ),
  });
