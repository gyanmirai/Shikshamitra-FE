import {
  CommunicationChannelType,
  CommunicationTemplateApprovalStatus,
} from 'src/redux/communication/communicationTypes';

import type { INotificationTemplate } from '../types';

export const getNotificationTemplateInitialValues = (editData?: INotificationTemplate | null) => ({
  templateName: editData?.templateName || '',
  targetRole: editData?.targetRole || '', // default to Student
  category: editData?.category || 'General',
  subject: editData?.subject || '',
  message: editData?.message || editData?.body || '',
  hashtags: editData?.hashtags || [], // empty array by default
  languageCode: editData?.languageCode || 'en',
  channels: editData?.channels?.length ? editData.channels : [CommunicationChannelType.InApp],
  approvalStatus: editData?.approvalStatus ?? CommunicationTemplateApprovalStatus.Draft,
});
