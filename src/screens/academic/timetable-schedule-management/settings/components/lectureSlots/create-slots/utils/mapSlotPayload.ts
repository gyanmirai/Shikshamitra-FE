import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

const SLOT_TYPE_MAP: Record<string, number> = { period: 0, break: 1 };
const BREAK_TYPE_MAP: Record<string, number> = { '': 0, short: 1, lunch: 2 };

export const mapSlotConfigurations = (slotConfigurations: any[]) =>
  slotConfigurations.map((config) => ({
    totalSlots: Number(config.totalSlots) || 0,
    weekRange: Array.isArray(config.weekRange) ? config.weekRange : [config.weekRange],
    timeSlots: (config.timeSlots || []).map((slot: any) => ({
      startTime: slot.startTime ? dateConvertor(slot.startTime.format(dateFormat)) : null,
      endTime: slot.endTime ? dateConvertor(slot.endTime.format(dateFormat)) : null,
      slotType: SLOT_TYPE_MAP[slot.slotType] ?? 0,
      breakType: BREAK_TYPE_MAP[slot.breakType || ''] ?? 0,
    })),
  }));
