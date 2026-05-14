import dayjs from 'dayjs';

export interface IGeneratedSlot {
  id: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  slotType: 'period' | 'break' | string;
  breakType: '' | 'short' | 'lunch' | string;
}

export const DEFAULT_SLOT_DURATION_MIN = 30;
export const DEFAULT_START_HOUR = 7;

export const getDefaultStartTime = () =>
  dayjs().hour(DEFAULT_START_HOUR).minute(0).second(0).millisecond(0);

/**
 * Generate `count` consecutive slots starting at 7:00 AM, each 30 minutes long.
 * `configKey` is used to namespace the slot ids so they remain unique across configs.
 */
export const generateSlots = (count: number, configKey: string | number = 0): IGeneratedSlot[] => {
  if (!Number.isFinite(count) || count < 1) return [];

  let cursor = getDefaultStartTime();

  return Array.from({ length: count }, (_, index) => {
    const startTime = cursor;
    const endTime = cursor.add(DEFAULT_SLOT_DURATION_MIN, 'minute');
    cursor = endTime;
    return {
      id: `${configKey}-${index}`,
      startTime,
      endTime,
      slotType: 'period',
      breakType: '',
    };
  });
};

export const createDefaultConfig = () => {
  const id = Date.now().toString();
  return {
    id,
    totalSlots: '',
    weekRange: [0, 5] as [number, number],
    timeSlots: [] as IGeneratedSlot[],
    expanded: true,
  };
};
