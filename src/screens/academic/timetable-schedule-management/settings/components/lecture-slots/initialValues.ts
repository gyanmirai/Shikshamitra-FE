import dayjs from 'dayjs';

export const getInitialValues = (classes: string, editData?: any) => {
  if (editData) {
    return {
      className: editData.className || classes || '',
      schoolHours: editData.schoolHours || '07:00 AM - 12:30 PM',
      previousClassSlots: editData.previousClassSlots || '',
      slotConfigurations: editData.slotConfigurations
        ? editData.slotConfigurations.map((config: any) => ({
            id: config.id || Date.now().toString(),
            totalSlots: config.totalSlots || '',
            weekRange: config.weekRange || [0, 5],
            timeSlots: config.timeSlots
              ? config.timeSlots.map((slot: any) => ({
                  id: slot.id,
                  startTime: slot.startTime ? dayjs(slot.startTime) : null,
                  endTime: slot.endTime ? dayjs(slot.endTime) : null,
                  slotType: slot.slotType || 'period',
                  breakType: slot.breakType || '',
                }))
              : [],
            expanded: false,
          }))
        : [
            {
              id: '1',
              totalSlots: editData.totalSlots || '',
              weekRange: [0, 5],
              timeSlots: editData.timeSlots
                ? editData.timeSlots.map((slot: any, index: number) => ({
                    id: `1-${index}`,
                    startTime: slot.startTime ? dayjs(slot.startTime) : null,
                    endTime: slot.endTime ? dayjs(slot.endTime) : null,
                    slotType: slot.slotType || 'period',
                    breakType: slot.breakType || '',
                  }))
                : [],
              expanded: false,
            },
          ],
    };
  }

  return {
    className: classes || '',
    schoolHours: '07:00 AM - 12:30 PM',
    previousClassSlots: '',
    slotConfigurations: [],
  };
};
