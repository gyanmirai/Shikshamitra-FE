import dayjs from 'dayjs';

import type { ISchoolWiseAnnouncement } from '../type';

export const getSchoolWiseAnnouncementInitialValues = (
  initialValues: ISchoolWiseAnnouncement | null
): ISchoolWiseAnnouncement => ({
  id: initialValues?.id || '',
  title: initialValues?.title || '',
  description: initialValues?.description || '',
  audience: initialValues?.audience || [],
  startDate: initialValues?.startDate ? dayjs(initialValues.startDate) : dayjs().add(1, 'hour'),
  endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : null,
  createdBy: initialValues?.createdBy || '',
  cratedOn: initialValues?.cratedOn ? dayjs(initialValues.cratedOn) : dayjs(),
  status: initialValues?.status ?? 0,
  duration: initialValues?.duration ?? 0,
  type: initialValues?.type || '',
  attachment: initialValues?.attachment || (null as unknown as File),
  importance_level: initialValues?.importance_level || {
    levelName: '',
    description: '',
    color: '',
  },
  link: initialValues?.link || '',
  active: initialValues?.active ?? 1,
  notification_preferences: initialValues?.notification_preferences || [],
  isAllowAcknoledgement: initialValues?.isAllowAcknoledgement ?? false,
  viewedBy: initialValues?.viewedBy ?? 0,
});
