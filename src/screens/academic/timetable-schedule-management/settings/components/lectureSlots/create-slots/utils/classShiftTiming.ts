import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';

import dayjs from 'dayjs';

export interface ClassShiftInfo {
  label: string;
  start: Dayjs;
  end: Dayjs;
}

export interface LectureSlotShift {
  shiftId?: string | null;
  shiftName?: string | null;
  shiftTimingLabel?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
}

interface TimeSlotValue {
  startTime?: string | Dayjs | null;
  endTime?: string | Dayjs | null;
}

interface SlotConfigurationValue {
  timeSlots?: TimeSlotValue[];
}

const FALLBACK_START = dayjs('2024-01-01T00:00:00');
const FALLBACK_END = dayjs('2024-01-01T23:59:59');

const parseShiftTime = (value?: string | null) => {
  if (!value) return null;
  const timeValue = value.length === 5 ? `${value}:00` : value;
  const parsed = dayjs(`2024-01-01T${timeValue}`);
  return parsed.isValid() ? parsed : null;
};

export const getClassShiftInfo = (standard?: Standards | null): ClassShiftInfo | null => {
  if (!standard?.shiftId) return null;

  const start = parseShiftTime(standard.shift?.startTime);
  const end = parseShiftTime(standard.shift?.endTime);
  if (!start || !end || !end.isAfter(start)) {
    return {
      label: 'School shift assigned. Timing details are not loaded.',
      start: FALLBACK_START,
      end: FALLBACK_END,
    };
  }

  return {
    label: `${standard.shift?.shiftName || 'Assigned shift'} (${start.format('hh:mm A')} - ${end.format('hh:mm A')})`,
    start,
    end,
  };
};

export const getClassShiftInfoFromSlot = (
  slot?: LectureSlotShift | null
): ClassShiftInfo | null => {
  if (!slot?.shiftId) return null;

  const start = parseShiftTime(slot.shiftStartTime);
  const end = parseShiftTime(slot.shiftEndTime);
  if (!start || !end || !end.isAfter(start)) {
    return {
      label: slot.shiftTimingLabel || 'School shift assigned. Timing details are not loaded.',
      start: FALLBACK_START,
      end: FALLBACK_END,
    };
  }

  return {
    label:
      slot.shiftTimingLabel ||
      `${slot.shiftName || 'Assigned shift'} (${start.format('hh:mm A')} - ${end.format('hh:mm A')})`,
    start,
    end,
  };
};

export const getSlotTimingError = (
  slotConfigurations: SlotConfigurationValue[],
  shiftInfo: ClassShiftInfo | null
): string | null => {
  if (!shiftInfo) {
    return 'Please assign the school shift to this class before configuring lecture slots.';
  }

  const shiftStartMin = shiftInfo.start.hour() * 60 + shiftInfo.start.minute();
  const shiftEndMin = shiftInfo.end.hour() * 60 + shiftInfo.end.minute();
  const outsideShiftSlot = slotConfigurations
    .flatMap((config) => config.timeSlots || [])
    .find((slot) => {
      const start = slot.startTime ? dayjs(slot.startTime) : null;
      const end = slot.endTime ? dayjs(slot.endTime) : null;
      if (!start?.isValid() || !end?.isValid()) return false;
      const startMin = start.hour() * 60 + start.minute();
      const endMin = end.hour() * 60 + end.minute();
      return startMin < shiftStartMin || endMin > shiftEndMin;
    });

  if (!outsideShiftSlot) return null;

  return `Lecture slot timing must be within the class shift timing ${shiftInfo.start.format(
    'hh:mm A'
  )} - ${shiftInfo.end.format('hh:mm A')}.`;
};
