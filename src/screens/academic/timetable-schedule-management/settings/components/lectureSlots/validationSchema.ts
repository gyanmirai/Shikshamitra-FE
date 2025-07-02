import dayjs from 'dayjs';
import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  className: Yup.string().required('Class is required'),
  schoolHours: Yup.string().required('School hours are required'),
  totalSlots: Yup.number()
    .required('Total slots are required')
    .min(1, 'At least one slot is required'),
  timeSlots: Yup.array()
    .of(
      Yup.object().shape({
        startTime: Yup.mixed()
          .test('is-valid-start', 'Start time is required', (value) => {
            if (!value) return false;

            // Handle different possible value types
            if (dayjs.isDayjs(value)) {
              return value.isValid();
            }

            // Try to parse as dayjs
            try {
              const parsed = dayjs(value as any);
              return parsed.isValid();
            } catch {
              return false;
            }
          })
          .required('Start time is required'),

        endTime: Yup.mixed()
          .test('is-valid-end', 'End time is required', (value) => {
            if (!value) return false;

            // Handle different possible value types
            if (dayjs.isDayjs(value)) {
              return value.isValid();
            }

            // Try to parse as dayjs
            try {
              const parsed = dayjs(value as any);
              return parsed.isValid();
            } catch {
              return false;
            }
          })
          .required('End time is required')
          .test('is-after-start', 'End time must be after start time', function (endTime) {
            const { startTime } = this.parent;

            if (!startTime || !endTime) return true;

            try {
              // More robust conversion handling
              let start;
              let end;

              if (dayjs.isDayjs(startTime)) {
                start = startTime;
              } else {
                start = dayjs(startTime);
              }

              if (dayjs.isDayjs(endTime)) {
                end = endTime;
              } else {
                end = dayjs(endTime as any);
              }

              // Check if both are valid
              if (!start.isValid() || !end.isValid()) return true;

              return end.isAfter(start);
            } catch {
              return true; // If conversion fails, let other validations handle it
            }
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
    .test('unique-start-times', 'Start times must be unique', function (timeSlots) {
      if (!timeSlots || timeSlots.length <= 1) return true;

      const startTimes = timeSlots
        .map((slot, index) => ({
          time: slot.startTime,
          index,
        }))
        .filter((item) => item.time); // Filter out null/undefined times

      // Check for duplicates
      for (let i = 0; i < startTimes.length; i += 1) {
        for (let j = i + 1; j < startTimes.length; j += 1) {
          try {
            let time1;
            let time2;

            if (dayjs.isDayjs(startTimes[i].time)) {
              time1 = startTimes[i].time;
            } else {
              time1 = dayjs(startTimes[i].time as any);
            }

            if (dayjs.isDayjs(startTimes[j].time)) {
              time2 = startTimes[j].time;
            } else {
              time2 = dayjs(startTimes[j].time as any);
            }

            if (dayjs.isDayjs(time1) && dayjs.isDayjs(time2) && time1.isSame(time2, 'minute')) {
              return this.createError({
                path: `timeSlots[${startTimes[j].index}].startTime`,
                message: 'Start times cannot be the same',
              });
            }
          } catch {
            // Skip invalid times
            return true; // Skip invalid times and continue validation
          }
        }
      }
      return true;
    })
    .test('unique-end-times', 'End times must be unique', function (timeSlots) {
      if (!timeSlots || timeSlots.length <= 1) return true;

      const endTimes = timeSlots
        .map((slot, index) => ({
          time: slot.endTime,
          index,
        }))
        .filter((item) => item.time); // Filter out null/undefined times

      // Check for duplicates
      for (let i = 0; i < endTimes.length; i += 1) {
        for (let j = i + 1; j < endTimes.length; j += 1) {
          try {
            let time1;
            let time2;

            if (dayjs.isDayjs(endTimes[i].time)) {
              time1 = endTimes[i].time;
            } else {
              time1 = dayjs(endTimes[i].time as any);
            }

            if (dayjs.isDayjs(endTimes[j].time)) {
              time2 = endTimes[j].time;
            } else {
              time2 = dayjs(endTimes[j].time as any);
            }

            if (dayjs.isDayjs(time1) && dayjs.isDayjs(time2) && time1.isSame(time2, 'minute')) {
              return this.createError({
                path: `timeSlots[${endTimes[j].index}].endTime`,
                message: 'End times cannot be the same',
              });
            }
          } catch {
            // Skip invalid times
            return true; // Skip invalid times and continue validation
          }
        }
      }
      return true;
    })
    .test('no-time-overlaps', 'Time slots cannot overlap', function (timeSlots) {
      if (!timeSlots || timeSlots.length <= 1) return true;

      // Create array of valid time slots for overlap checking
      const validSlots = timeSlots
        .map((slot, index) => {
          try {
            let startTime;
            let endTime;

            if (dayjs.isDayjs(slot.startTime)) {
              startTime = slot.startTime;
            } else {
              startTime = dayjs(slot.startTime as any);
            }

            if (dayjs.isDayjs(slot.endTime)) {
              endTime = dayjs(slot.endTime);
            } else {
              endTime = dayjs(slot.endTime as any);
            }
            return {
              ...slot,
              index,
              startTime,
              endTime,
            };
          } catch {
            return null;
          }
        })
        .filter(
          (slot) =>
            slot &&
            slot.startTime &&
            slot.endTime &&
            slot.startTime.isValid() &&
            slot.endTime.isValid() &&
            slot.endTime.isAfter(slot.startTime)
        );

      // Check for overlaps
      for (let i = 0; i < validSlots.length; i += 1) {
        for (let j = i + 1; j < validSlots.length; j += 1) {
          const slot1 = validSlots[i];
          const slot2 = validSlots[j];

          // Check if slots overlap
          const overlap =
            // slot1 starts before slot2 ends AND slot1 ends after slot2 starts
            slot1?.startTime.isBefore(slot2?.endTime) && slot1.endTime.isAfter(slot2?.startTime);

          if (overlap) {
            return this.createError({
              path: `timeSlots[${slot2?.index}].startTime`,
              message: `This slot overlaps with slot ${(slot1?.index ?? -1) + 1}`,
            });
          }
        }
      }
      return true;
    }),
});
