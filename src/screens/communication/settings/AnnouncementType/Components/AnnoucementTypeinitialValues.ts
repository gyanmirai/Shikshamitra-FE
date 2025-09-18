import type { IAnnouncementType } from './type';

export const getAnnouncementTypeInitialValues = (editData?: IAnnouncementType | null) => ({
  announcementType: editData?.announcementType || '',
  description: editData?.description || '',
});
