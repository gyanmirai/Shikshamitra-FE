import dayjs from 'dayjs';

export const getPackageInitialValues = (editData?: any) => ({
  name: editData?.name || '',
  description: editData?.description || '',
  amount: editData?.amount || 0,
  depositAmount: editData?.depositAmount || 0,
  facilityGroup: editData?.facilityGroup || '',
  otherFacilities: editData?.otherFacilities || '',
  scheduleDate: dayjs(editData?.scheduleDate) || '',
  status: editData?.status || 'draft',
});
