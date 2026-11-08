import dayjs from 'dayjs';
import { convertBase64Format } from 'src/utils/base64Formate';
import { ReligionType, ReligionTypeArray } from 'src/enums/religion';

import { getPersonalInfoSupplementaryFields } from './personal-info-supplementary-fields';

import type { IPersonalInformationResponse } from './types';

const toProfilePhotoValue = (value?: string | null) => {
  if (!value) return '';
  if (value.startsWith('data:') || value.startsWith('http')) return value;
  return convertBase64Format(value);
};

const toReligionValue = (value?: IPersonalInformationResponse['religion']) => {
  if (typeof value === 'number') return value;
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  const enumValue = ReligionType[normalized as keyof typeof ReligionType];
  if (typeof enumValue === 'number') return enumValue;
  const labelValue = ReligionTypeArray.find(
    (option) => option.label.toLowerCase() === normalized.toLowerCase()
  )?.value;
  if (typeof labelValue === 'number') return labelValue;
  return normalized.toLowerCase() === 'hindu' ? ReligionType.Hinduism : '';
};

export const personalInformationInitialValues = (
  editData?: Partial<IPersonalInformationResponse>
) => ({
  photo: toProfilePhotoValue(editData?.profilePicture || editData?.thumbnailPicture),
  lastName: editData ? editData.lastName : '',
  firstName: editData ? editData.firstName : '',
  middleName: editData ? editData.middleName : '',
  shortName: editData ? editData.shortName : '',
  // employeeStatusType: editData ? editData?.employeeStatusType : EmployeeStatusType.Active,
  // subject: editData ? editData.subject || [] : [],
  dob: editData ? dayjs(editData.dob, 'YYYY-MM-DD') : null,
  familyCast: editData ? editData.familyCaste : '',
  castType: editData ? editData.casteType : '',
  gender: editData?.gender ?? '',
  religion: editData ? toReligionValue(editData.religion) : '',
  maritalStatus: editData
    ? typeof editData.maritalStatus === 'number'
      ? editData.maritalStatus
      : ''
    : '',
  bloodGroup: editData
    ? typeof editData.bloodGroup === 'number'
      ? editData.bloodGroup
      : null
    : null,
  mobileNo: editData ? editData.mobileNo : '',
  secondaryMobileNo: editData ? editData?.secondaryMobileNo : null,
  email: editData ? editData.email : '',
  department: editData ? editData.department : '',
  dateOfJoining: editData ? dayjs(editData.doj, 'YYYY-MM-DD') : dayjs(),
  employeeGroup: editData ? (editData.isTeaching ? 0 : 1) : '',
  ...getPersonalInfoSupplementaryFields(editData),
  role: editData ? editData?.roleId : '',
  addressLine1: editData ? editData.address1 : '',
  addressLine2: editData ? editData.address2 : '',
  addressLine3: editData ? editData.address3 : '',
  country: editData?.country?.name
    ? { name: editData.country.name, isoCode: editData.country.isoCode }
    : { name: 'India', isoCode: 'IN' },

  state: editData?.state?.name
    ? {
        name: editData.state.name,
        isoCode: editData.state.isoCode,
        countryCode: editData.country?.isoCode,
      }
    : { name: '', isoCode: '' },

  city: editData?.city ? { name: editData.city } : { name: '' },

  pincode: editData?.pinCode ?? '',

  employeeId: editData?.id ?? '',

  shift: editData?.shiftId ?? '',
  shiftEffectiveFrom: '',

  adharNo: editData?.adharNo ?? '',
  panNo: editData?.panNo ?? '',
  initialAdharNo: editData?.adharNo ?? '',
  initialPanNo: editData?.panNo ?? '',
});
