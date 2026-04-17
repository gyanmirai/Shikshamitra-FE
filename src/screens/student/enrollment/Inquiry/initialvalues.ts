import type { GenderType } from 'src/enums/gender';

import dayjs from 'dayjs';
import calculateAge from 'src/utils/calculate-age';

import type { IInquiryResponse, IInquiryFormValues } from './type';

export const inquiryInitialValues: (
  editData: IInquiryResponse | null,
  academicYearId: string
) => IInquiryFormValues = (editData: IInquiryResponse | null, academicYearId: string) => ({
  medium: editData?.academicMediumId || '',
  academicYear: editData?.academicYearId || academicYearId,
  class: editData?.standardId || '',
  lastName: editData?.lastName || '',
  city: editData ? { name: editData?.city } : { name: '' },
  state: editData
    ? {
        name: editData?.state?.name,
        isoCode: editData?.state?.isoCode,
        countryCode: editData?.country?.isoCode,
      }
    : { name: '', isoCode: '' },
  pinCode: editData?.pinCode || '',
  firstName: editData?.firstName || '',
  middleName: editData?.middleName || '',
  dateOfBirth: editData?.dateOfBirth ? dayjs(editData?.dateOfBirth) : null,
  age: editData?.dateOfBirth ? calculateAge(dayjs(editData?.dateOfBirth).format()) : '',

  dateOfInquiry: editData?.dateOfInquiry ? dayjs(editData?.dateOfInquiry) : dayjs(new Date()),
  gender: (editData?.gender ?? '') as GenderType,
  address: editData?.address || '',
  primaryContactNumber: editData?.primaryContactNo || '',
  secondaryContactNumber: editData?.secondaryContactNo || '',
  previousSchool: editData?.previousSchool || '',
  inquiryPreferences: editData?.inquiryPreferenceId || '',
  board: editData?.academicBoardId || '',
  formNo: editData?.formNo || undefined,
  country: editData
    ? { name: editData?.country?.name, isoCode: editData?.country?.isoCode }
    : { name: 'India', isoCode: 'IN' },
  addressLine1: editData?.address1 || '',
  addressLine2: editData?.address2 || '',
  addressLine3: editData?.address3 || '',
  email: editData?.email || '',
  // village: editData?.village || '',
  // organization: editData?. || '',
});
