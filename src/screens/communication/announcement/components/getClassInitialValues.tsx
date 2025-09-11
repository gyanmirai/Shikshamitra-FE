import dayjs from 'dayjs';

import type { IClassWiseAnnouncement } from '../type';

export const getClassInitialValues = (initialValues: IClassWiseAnnouncement | null) => ({
  id: initialValues?.id || '',
  title: initialValues?.title || '',
  description: initialValues?.description || '',
  audience: initialValues?.audience || [],
  organizations: initialValues?.organizations || [],
  classes: initialValues?.classes || [],
  divisions: initialValues?.divisions || [],
  startDate: initialValues?.startDate ? dayjs(initialValues?.startDate) : dayjs().add(1, 'hours'),
  endDate: initialValues?.endDate ? dayjs(initialValues?.endDate) : null,
  createdBy: initialValues?.createdBy || '',
  cratedOn: initialValues?.cratedOn ? dayjs(initialValues?.cratedOn) : null,
  status: initialValues?.status || 0,
  type: initialValues?.type || '',
  attachment: initialValues?.attachment || null,
  importance_level: initialValues?.importance_level || '',
  link: initialValues?.link || '',
  active: initialValues?.active || 1,
  notification_preferences: initialValues?.notification_preferences || [],
  isAllowAcknoledgement: initialValues?.isAllowAcknoledgement || false,
  viewedBy: initialValues?.viewedBy || 0,
});
