import dayjs from 'dayjs';

import type { IClassAnnouncement } from '../type';

export const getClassInitialValues = (initialValues: IClassAnnouncement | null) => ({
  title: initialValues?.title || '',
  description: initialValues?.description || '',
  audience: initialValues?.audience || [],
  className: initialValues?.className || [],
  division: initialValues?.division || [],
  publishDate: initialValues?.publishDate
    ? dayjs(initialValues?.publishDate)
    : dayjs().add(1, 'hours'),
  expiryDate: initialValues?.expiryDate ? dayjs(initialValues?.expiryDate) : null,
  category: initialValues?.category || '',
  importance_level: initialValues?.importance_level || '',
  link: initialValues?.link || '',
  notification_preferences: initialValues?.notification_preferences || [],
  isScheduled: initialValues?.isScheduled || false,
  status: initialValues?.status || 'Published',
});
