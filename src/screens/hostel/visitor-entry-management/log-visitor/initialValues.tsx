import dayjs from 'dayjs';

import type { IVisitorData } from './type';

export const getVisitorInitialValues = (editData?: IVisitorData | null) => ({
  visitorName: editData?.visitorName || '',
  idProof: editData?.idProof || '',
  contactNo: editData?.contactNo || '',
  reasonForVisit: editData?.reasonForVisit || '',
  entryTime: dayjs(editData?.entryTime) || dayjs(),
  exitTime: dayjs(editData?.exitTime) || null,
  personToVisit: editData?.personToVisit || '',
});
