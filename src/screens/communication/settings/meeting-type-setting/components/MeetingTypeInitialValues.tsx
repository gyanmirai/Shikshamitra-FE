import type { IMeetingType } from '../type';

// Initial values for MeetingTypeForm
export const getMeetingTypeInitialValues = (editData: IMeetingType | null) => ({
  meetingType: editData?.meetingType || '',
  description: editData?.description || '',
});
