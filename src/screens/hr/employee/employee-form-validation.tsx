import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

const personalInformationValidationSchema = Yup.object({
  photo: Yup.string().required('Photo is required'),
  //   code: Yup.string().required('Code is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string().required('Middle name is required'),
  shortName: Yup.string(),
  employeeStatusType: Yup.number().required('Employee status type is required'),
  //   subject: Yup.array().required('Subject is required'),
  dob: Yup.date().nullable().required('Date of birth is required'),
  familyCast: Yup.string().required('Family cast is required'),
  castType: Yup.string().required('Cast type is required'),
  gender: Yup.string().required('Gender is required'),
  religion: Yup.string().required('Religion is required'),
  maritalStatus: Yup.string().required('Marital status is required'),
  bloodGroup: Yup.string(),
  mobileNo: Yup.string()
    .test('mobileNo', 'mobile number is not valid', (value) => matchIsValidTel(value as string))
    .required('Mobile number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  department: Yup.string(),
  designation: Yup.string(),
  dateOfJoining: Yup.date().nullable().required('Date of joining is required'),
  employeeGroup: Yup.string().required('Employee group is required'),
  qualification: Yup.string(),
  role: Yup.string().required('Role is required'),
  //   identificationMark1: Yup.string().required('Identification mark is required'),
  addressLine1: Yup.string(),
  addressLine2: Yup.string(),
  addressLine3: Yup.string(),
  country: Yup.object()
    .shape({ name: Yup.string().required('Country is required') })
    .default(() => ({ name: '' }))
    .required('Country is required'),

  city: Yup.object()
    .shape({ name: Yup.string().required('City is required') })
    .default(() => ({ name: '' }))
    .required('City is required'),
  state: Yup.object()
    .shape({ name: Yup.string().required('State is required') })
    .default(() => ({ name: '' }))
    .required('State is required'),
  pincode: Yup.number().test('picode', 'Must be exactly 6 numbers', (value) =>
    value ? !!`${value}`.match(/\b\d{6}\b/) : true
  ),
  organization: Yup.string().required('Organization is required'),
  shift: Yup.string().required('Shift is required'),
  //   employeeId: Yup.string().required('Employee ID is required'),
});

const familyInformationValidationSchema = Yup.object({
  fatherName: Yup.string().nullable(),
  //   fatherOccupation: Yup.string().required('Father occupation is required'),
  fatherContactNo: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )
    .nullable(),
  // fatherAddress1: Yup.string(),
  // fatherAddress2: Yup.string(),

  // fatherAddress3: Yup.string(),
  // fatherCountry: Yup.object(),
  // fatherState: Yup.object(),
  // fatherCity: Yup.object(),
  fatherPinCode: Yup.number()
    .test('pincode', 'Must be exactly 6 numbers', (value) =>
      value ? !!`${value}`.match(/\b\d{6}\b/) : true
    )
    .nullable(),
  motherName: Yup.string().nullable(),
  //   motherOccupation: Yup.string().required('Mother occupation is required'),
  motherContactNo: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )
    .nullable(),
  // motherAddress1: Yup.string(),
  // motherAddress2: Yup.string(),
  // motherAddress3: Yup.string(),
  // motherCountry: Yup.object(),
  // motherState: Yup.object(),
  // motherCity: Yup.object(),
  motherPinCode: Yup.number()
    .test('pincode', 'Must be exactly 6 numbers', (value) =>
      value ? !!`${value}`.match(/\b\d{6}\b/) : true
    )
    .nullable(),
  spouseName: Yup.string().nullable(),
  //   spouseOccupation: Yup.string().required('Spouse occupation is required'),
  spouseContactNo: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )
    .nullable(),
  // spouseAddress1: Yup.string(),
  // spouseAddress2: Yup.string(),
  // spouseAddress3: Yup.string(),

  // spouseCountry: Yup.object(),
  // spouseState: Yup.object(),
  // spouseCity: Yup.object(),
  spousePinCode: Yup.number()
    .test('pincode', 'Must be exactly 6 numbers', (value) =>
      value ? !!`${value}`.match(/\b\d{6}\b/) : true
    )
    .nullable(),
});

export const validations = [
  personalInformationValidationSchema,
  familyInformationValidationSchema,
  Yup.object({}),
  Yup.object({}),
  Yup.object({}),
];
