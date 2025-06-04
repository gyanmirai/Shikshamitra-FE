import dayjs from 'dayjs';

import calculateAge from 'src/utils/calculate-age';

import { GenderType } from 'src/enums/gender';

import type { IInquiryData } from '.';
import type { IInquiryFormValues } from './type';

export const inquiryInitialValues: (editData: IInquiryData | null) => IInquiryFormValues = (
  editData: IInquiryData | null
) => ({
  medium: editData?.educationMediumId || '',
  academicYear: editData?.academicYearId || '',
  class: editData?.standardId || '',
  lastName: editData?.lastName || '',
  city: editData ? { name: editData?.city } : { name: '' },
  state: editData
    ? { name: editData?.state?.name, isoCode: editData?.state?.isoCode }
    : { name: '', isoCode: '' },
  pinCode: editData?.pinCode || null,
  firstName: editData?.firstName || '',
  middleName: editData?.middleName || '',
  dateOfBirth: editData?.dateOfBirth ? dayjs(editData?.dateOfBirth) : null,
  age: editData?.dateOfBirth ? calculateAge(dayjs(editData?.dateOfBirth).format()) : '',

  dateOfInquiry: editData?.dateOfInquiry ? dayjs(editData?.dateOfInquiry) : dayjs(new Date()),
  gender: editData?.genderType || GenderType.Male,
  address: editData?.address || '',
  primaryContactNumber: editData?.primaryContactNumber || '',
  secondaryContactNumber: editData?.secondaryContactNumber || '',
  previousSchool: editData?.previousSchoolName || '',
  inquiryPreferences: editData?.inquiryPreferenceId || '',
  board: editData?.educationBoardId || '',
  formNo: editData?.formNumber || undefined,
  country: editData
    ? { name: editData?.country?.name, isoCode: editData?.country?.isoCode }
    : { name: '', isoCode: '' },
  addressLine1: editData?.addressLine1 || '',
  addressLine2: editData?.addressLine2 || '',
  addressLine3: editData?.addressLine3 || '',
  email: editData?.email || '',
  // village: editData?.village || '',
  // organization: editData?. || '',
});
