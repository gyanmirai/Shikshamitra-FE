const SLOT_TYPE_MAP: Record<string, number> = { period: 0, break: 1 };
const BREAK_TYPE_MAP: Record<string, number> = { short: 0, lunch: 1 };

export const mapSlotConfigurations = (slotConfigurations: any[]) =>
  slotConfigurations.map((config) => ({
    totalSlots: Number(config.totalSlots) || 0,
    weekRange: Array.isArray(config.weekRange) ? config.weekRange : [config.weekRange],
    timeSlots: (config.timeSlots || []).map((slot: any) => ({
      startTime: slot.startTime ? slot.startTime.format('HH:mm:ss') : null,
      endTime: slot.endTime ? slot.endTime.format('HH:mm:ss') : null,
      slotType: SLOT_TYPE_MAP[slot.slotType] ?? 0,
      breakType: BREAK_TYPE_MAP[slot.breakType] ?? 0,
    })),
  }));
