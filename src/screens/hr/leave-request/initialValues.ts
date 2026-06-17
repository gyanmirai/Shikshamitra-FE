import dayjs from 'dayjs';
import { convertBase64Format } from 'src/utils/base64Formate';

// will add type tommorrow working on it

export const leaveRequestInitialValues = (editData: any) => ({
  paidType: editData?.paidType || '',
  description: editData?.description || '',
  startDate: editData?.startDate ? dayjs(editData?.startDate) : null,
  endDate: editData?.endDate ? dayjs(editData?.endDate) : null,
  startTime: editData?.startTime || '',
  endTime: editData?.endTime || '',
  isHalfDay: editData?.halfDay || false,
  rejectionReason: editData?.rejectionReason || '',
  status: editData?.status || 'PENDING',

  docs: editData?.attachment ? convertBase64Format(editData?.attachment) : '',
});
