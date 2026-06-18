import { ReligionType } from 'src/enums/religion';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

import { toRawMobile } from './employee-form';

export function buildProfilePersonalInfoUpdatePayload(values: any): Record<string, any> {
  const body: Record<string, any> = {
    lastName: values.lastName,
    firstName: values.firstName,
    middleName: values.middleName || '',
    shortName: values.shortName || '',
    dob: dateConvertor(values.dob.format(dateFormat)),
    familyCaste: values.familyCast,
    casteType: values.castType,
    gender: values.gender,
    religion: ReligionType[values.religion],
    maritalStatus: values.maritalStatus,
    bloodGroup: values.bloodGroup,
    mobileNo: toRawMobile(values.mobileNo),
    email: values.email,
    department: values.department,
    doj: dateConvertor(values.dateOfJoining.format(dateFormat)),
    isTeaching: values.employeeGroup === 0,
    roleId: values.role,
    address1: values.addressLine1,
    address2: values.addressLine2,
    country: { name: values?.country?.name, isoCode: values?.country?.isoCode },
    state: { name: values?.state?.name, isoCode: values?.state?.isoCode },
    city: values?.city?.name,
    pinCode: String(values.pincode),
    shiftId: values.shift,
  };

  if (values.secondaryMobileNo) {
    body.secondaryMobileNo = toRawMobile(values.secondaryMobileNo);
  }
  if (values.addressLine3) {
    body.address3 = values.addressLine3;
  }

  return body;
}
