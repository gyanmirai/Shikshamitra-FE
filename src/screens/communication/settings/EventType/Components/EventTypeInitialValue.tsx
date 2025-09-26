import type { IEventType } from '../type';

export const getEventTypeInitialValues = (editData?: IEventType | null) => ({
  eventType: editData?.eventType || '',
  description: editData?.description || '',
  color: editData?.color || '',
});
