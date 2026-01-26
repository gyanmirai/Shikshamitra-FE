import type { IEventType } from '../type';

export const getEventTypeInitialValues = (editData?: IEventType | null) => ({
  name: editData?.name || '',
  description: editData?.description || '',
  color: editData?.color || '',
});
