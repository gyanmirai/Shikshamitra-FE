import dayjs from 'dayjs';

import type { ISchoolWiseAnnouncement } from '../type';

export const getSchoolInitialValues = (initialValues: ISchoolWiseAnnouncement | null) => ({
  title: initialValues?.title || '',
  description: initialValues?.description || '',
  status: initialValues?.status || '',
  audience: initialValues?.audience || [],
  organization: initialValues?.organization || [],
  publishDate: initialValues?.publishDate
    ? dayjs(initialValues?.publishDate)
    : dayjs().add(1, 'hour'),
  expiryDate: initialValues?.expiryDate ? dayjs(initialValues?.expiryDate) : null,
  category: initialValues?.category || '',
  importance_level: initialValues?.importance_level || '',
  link: initialValues?.link || '',
  notification_preferences: initialValues?.notification_preferences || [],
  isScheduled: initialValues?.isScheduled || false,
});
