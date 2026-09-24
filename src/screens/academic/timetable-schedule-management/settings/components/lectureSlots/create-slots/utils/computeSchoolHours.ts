import dayjs from 'dayjs';

interface TimeSlotValue {
  startTime?: string | null;
  endTime?: string | null;
}

interface SlotConfigurationValue {
  timeSlots?: TimeSlotValue[];
}

export const computeSchoolHours = (slotConfigurations: SlotConfigurationValue[]): string => {
  let minStartMins = Infinity;
  let maxEndMins = -Infinity;

  slotConfigurations.forEach((config) => {
    (config.timeSlots || []).forEach((slot) => {
      const start = slot.startTime ? dayjs(slot.startTime) : null;
      const end = slot.endTime ? dayjs(slot.endTime) : null;
      if (start?.isValid()) {
        minStartMins = Math.min(minStartMins, start.hour() * 60 + start.minute());
      }
      if (end?.isValid()) {
        maxEndMins = Math.max(maxEndMins, end.hour() * 60 + end.minute());
      }
    });
  });

  if (!Number.isFinite(minStartMins) || !Number.isFinite(maxEndMins)) return '';

  const formatMinutes = (totalMins: number) =>
    dayjs()
      .hour(Math.floor(totalMins / 60))
      .minute(totalMins % 60)
      .format('hh:mm A');

  return `${formatMinutes(minStartMins)} - ${formatMinutes(maxEndMins)}`;
};
