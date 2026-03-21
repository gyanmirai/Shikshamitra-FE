import dayjs from 'dayjs';

import type { IHostelRequestFormType } from './type';

export const getHostelRequestInitialValues = (data?: IHostelRequestFormType | null) => ({
  hostelName: data?.hostelName || '',
  hostelType: data?.hostelType || '',
  className: data?.className || '',
  division: data?.division || '',
  name: data?.name || '',
  gender: data?.gender || '',
  dateOfBirth: dayjs(data?.dateOfBirth) || '',
  roomType: data?.roomType || '',
  totalAmount: data?.totalAmount || 0,
  scheduleDate: dayjs(data?.scheduleDate) || dayjs(),
  joinDate: dayjs(data?.joinDate) || null,
  feesFrequency: data?.feesFrequency || '',
  iterationCost: data?.iterationCost || '',
  email: data?.email || '',
  parentsContactNo: data?.parentsContactNo || '',
  alternateContactDetails: data?.alternateContactDetails || '',
  addressLine1: data?.addressLine1 || '',
  addressLine2: data?.addressLine2 || '',
  addressLine3: data?.addressLine3 || '',
  country: data
    ? { name: data?.country?.name, isoCode: data?.country?.isoCode }
    : { name: '', isoCode: '' },
  city: data ? { name: data?.city } : { name: '' },
  state: data
    ? { name: data?.state?.name, isoCode: data?.state?.isoCode }
    : { name: '', isoCode: '' },
  village: data?.village || '',
  pinCode: data?.pinCode || '',
});
