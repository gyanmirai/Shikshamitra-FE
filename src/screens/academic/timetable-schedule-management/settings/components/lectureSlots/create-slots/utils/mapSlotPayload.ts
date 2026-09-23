const SLOT_TYPE_MAP: Record<string, number> = { period: 0, break: 1 };
const BREAK_TYPE_MAP: Record<string, number> = { short: 0, lunch: 1 };

export const mapSlotConfigurations = (slotConfigurations: any[]) =>
  slotConfigurations.map((config) => {
    const activeDays = [...new Set<number>(Array.isArray(config.weekRange) ? config.weekRange : [])]
      .map(Number)
      .sort((a, b) => a - b);

    return {
      totalSlots: Number(config.totalSlots) || 0,
      activeDays,
      weekRange: activeDays.length > 0 ? [activeDays[0], activeDays[activeDays.length - 1]] : [],
      timeSlots: (config.timeSlots || []).map((slot: any) => ({
        startTime: slot.startTime ? slot.startTime.format('HH:mm:ss') : null,
        endTime: slot.endTime ? slot.endTime.format('HH:mm:ss') : null,
        slotType: SLOT_TYPE_MAP[slot.slotType] ?? 0,
        breakType: slot.slotType === 'break' ? (BREAK_TYPE_MAP.short ?? 0) : 0,
      })),
    };
  });
