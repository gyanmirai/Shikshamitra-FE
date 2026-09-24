import dayjs from 'dayjs';

export const getInitialValues = (classes: string, editData?: any) => {
  if (editData) {
    return {
      className: editData.standardId || classes || '',
      previousClassSlots: editData.previousStandardId || '',
      slotConfigurations: editData.slotConfigurations
        ? editData.slotConfigurations.map((config: any, configIndex: number) => ({
            id: config.id || configIndex,
            totalSlots: config.totalSlots || '',
            weekRange:
              config.activeDays?.length > 0
                ? config.activeDays
                : config.weekRange?.length >= 2
                  ? Array.from(
                      { length: config.weekRange[1] - config.weekRange[0] + 1 },
                      (_unused, dayOffset) => config.weekRange[0] + dayOffset
                    )
                  : [0, 1, 2, 3, 4, 5],
            timeSlots: config.timeSlots
              ? config.timeSlots.map((slot: any, index: number) => ({
                  id: slot.id || index,
                  startTime: slot.startTime ? dayjs(slot.startTime, 'HH:mm:ss') : null,
                  endTime: slot.endTime ? dayjs(slot.endTime, 'HH:mm:ss') : null,
                  slotType: Number(slot.slotType) === 1 ? 'break' : 'period',
                  breakType:
                    Number(slot.breakType) === 0
                      ? 'short'
                      : Number(slot.breakType) === 1
                        ? 'lunch'
                        : '',
                }))
              : [],
            expanded: false,
          }))
        : [
            {
              id: '1',
              totalSlots: editData.totalSlots || '',
              weekRange: [0, 1, 2, 3, 4, 5],
              timeSlots: editData.timeSlots
                ? editData.timeSlots.map((slot: any, index: number) => ({
                    id: `1-${index}`,
                    startTime: slot.startTime ? dayjs(slot.startTime) : null,
                    endTime: slot.endTime ? dayjs(slot.endTime) : null,
                    slotType: Number(slot.slotType) === 1 ? 'break' : 'period',
                    breakType:
                      Number(slot.breakType) === 0
                        ? 'short'
                        : Number(slot.breakType) === 1
                          ? 'lunch'
                          : '',
                  }))
                : [],
              expanded: false,
            },
          ],
    };
  }

  return {
    className: classes || '',
    previousClassSlots: '',
    slotConfigurations: [],
  };
};
