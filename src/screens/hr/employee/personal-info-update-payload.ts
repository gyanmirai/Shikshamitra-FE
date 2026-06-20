import { ReligionType } from 'src/enums/religion';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

const toRawMobile = (value: string | null | undefined) => {
  if (!value) return '';
  return value.replace(/\s/g, '').replace(/^\+91/, '');
};

const normalizeText = (value: unknown) => String(value ?? '').trim();
const normalizePan = (value: unknown) => normalizeText(value).toUpperCase();
const normalizeEnumLabel = <TEnum extends Record<string, string | number>>(
  enumType: TEnum,
  value: unknown
) => (typeof value === 'number' ? enumType[value as keyof TEnum] : value);

const shouldIncludeIdentity = (
  currentValue: unknown,
  originalValue: unknown,
  normalize: (value: unknown) => string
) => {
  const current = normalize(currentValue);
  if (!current) return false;
  if (originalValue === undefined || originalValue === null) return true;
  return current !== normalize(originalValue);
};

type PersonalInfoUpdatePayloadOptions = {
  initialValues?: Record<string, any>;
};

export function buildProfilePersonalInfoUpdatePayload(
  values: any,
  options: PersonalInfoUpdatePayloadOptions = {}
): Record<string, any> {
  const body: Record<string, any> = {
    lastName: values.lastName,
    firstName: values.firstName,
    middleName: values.middleName || '',
    shortName: values.shortName || '',
    dob: dateConvertor(values.dob.format(dateFormat)),
    familyCaste: values.familyCast,
    casteType: values.castType,
    gender: values.gender,
    religion: normalizeEnumLabel(ReligionType, values.religion),
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
  const initialValues = options.initialValues ?? values;
  const originalPanNo = initialValues.initialPanNo ?? initialValues.panNo;
  const originalAdharNo = initialValues.initialAdharNo ?? initialValues.adharNo;

  if (shouldIncludeIdentity(values.panNo, originalPanNo, normalizePan)) {
    body.panNo = normalizePan(values.panNo);
  }
  if (shouldIncludeIdentity(values.adharNo, originalAdharNo, normalizeText)) {
    body.adharNo = normalizeText(values.adharNo);
  }

  return body;
}
