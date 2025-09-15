import dayjs from 'dayjs';

import type { IEventAnnouncement } from '../type';

export const getEventInitialValues = (initialValues: IEventAnnouncement | null) => ({
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
  createdOn: initialValues?.createdOn ? dayjs(initialValues?.createdOn) : null,
  status: initialValues?.status || 0,
  type: initialValues?.type || '',
  attachment: initialValues?.attachment || null,
  importance_level: initialValues?.importance_level || '',
  link: initialValues?.link || '',
  active: initialValues?.active ?? 1,
  eventMode: initialValues?.eventMode || 'offline',
  onlineLink: initialValues?.onlineLink || '',
  venue: initialValues?.venue || '',
});
