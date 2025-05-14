import dayjs from 'dayjs';

import type { IHostelIncident } from '../type';

export const getIncidentInitialValues = (editData?: IHostelIncident | null) => ({
  hostelName: editData?.hostelName || '',
  emeregencyLevel: editData?.emeregencyLevel || '',
  students: editData?.students || [],
  incidentDate: dayjs(editData?.incidentDate) || null,
  incidentTime: dayjs(editData?.incidentTime) || null,
  description: editData?.description || '',
  incidentType: editData?.incidentType || '',
  documents: editData?.documents || null,
});
