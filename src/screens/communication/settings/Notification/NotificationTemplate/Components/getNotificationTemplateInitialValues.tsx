import type { INotificationTemplate } from './type';

export const getNotificationTemplateInitialValues = (editData?: INotificationTemplate | null) => ({
  templateName: editData?.templateName || '',
  targetRole: editData?.targetRole || '', // default to Student
  subject: editData?.subject || '',
  message: editData?.message || '',
  hashtags: editData?.hashtags || [], // empty array by default
});
