import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

const personalInformationValidationSchema = Yup.object({
  photo: Yup.string().required('Photo is required'),
  //   code: Yup.string().required('Code is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string().required('Middle name is required'),
  shortName: Yup.string().required('Short name is required'),
  employeeStatusType: Yup.number().required('Employee status type is required'),
  //   subject: Yup.array().required('Subject is required'),
  dob: Yup.date().nullable().required('Date of birth is required'),
  familyCast: Yup.string().required('Family cast is required'),
  castType: Yup.string().required('Cast type is required'),
  gender: Yup.string().required('Gender is required'),
  religion: Yup.string().required('Religion is required'),
  maritalStatus: Yup.string().required('Marital status is required'),
  bloodGroup: Yup.string().required('Blood group is required'),
  mobileNo: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) => matchIsValidTel(value as string))
    .required('Mobile number is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  department: Yup.string().required('Department is required'),
  designation: Yup.string().required('Designation is required'),
  dateOfJoining: Yup.date().nullable().required('Date of joining is required'),
  employeeGroup: Yup.string().required('Employee group is required'),
  qualification: Yup.string().required('Qualification is required'),
  role: Yup.string().required('Role is required'),
  //   identificationMark1: Yup.string().required('Identification mark is required'),
  address: Yup.string().required('Address is required'),
  state: Yup.string().required('State is required'),
  city: Yup.string().required('City is required'),
  pincode: Yup.number()
    .test('picode', 'Must be exactly 6 numbers', (value) => !!`${value}`.match(/\b\d{6}\b/))

    .required('Pin code is required'),
  organization: Yup.string().required('Organization is required'),
  //   employeeId: Yup.string().required('Employee ID is required'),
});

const familyInformationValidationSchema = Yup.object({
  fatherName: Yup.string().required('Father name is required'),
  //   fatherOccupation: Yup.string().required('Father occupation is required'),
  fatherContactNo: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) => matchIsValidTel(value as string))
    .required('Mobile number is required'),
  fatherAddress: Yup.string().required('Father address is required'),
  fatherState: Yup.string().required('Father state is required'),
  fatherCity: Yup.string().required('Father city is required'),
  fatherPinCode: Yup.number()
    .test('pincode', 'Must be exactly 6 numbers', (value) => !!`${value}`.match(/\b\d{6}\b/))
    .required('Father pin code is required'),
  motherName: Yup.string().required('Mother name is required'),
  //   motherOccupation: Yup.string().required('Mother occupation is required'),
  motherContactNo: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) => matchIsValidTel(value as string))
    .required('Mobile number is required'),
  motherAddress: Yup.string().required('Mother address is required'),
  motherState: Yup.string().required('Mother state is required'),
  motherCity: Yup.string().required('Mother city is required'),
  motherPinCode: Yup.number()
    .test('pincode', 'Must be exactly 6 numbers', (value) => !!`${value}`.match(/\b\d{6}\b/))
    .required('Mother pin code is required'),
  spouseName: Yup.string().required('Spouse name is required'),
  //   spouseOccupation: Yup.string().required('Spouse occupation is required'),
  spouseContactNo: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) => matchIsValidTel(value as string))
    .required('Mobile number is required'),
  spouseAddress: Yup.string().required('address is required'),
  spouseState: Yup.string().required('state is required'),
  spouseCity: Yup.string().required('city is required'),
  spousePinCode: Yup.number()
    .test('pincode', 'Must be exactly 6 numbers', (value) => !!`${value}`.match(/\b\d{6}\b/))
    .required('pin code is required'),
});
export const validations = [
  personalInformationValidationSchema,
  familyInformationValidationSchema,
  Yup.object({}),
  Yup.object({}),
  Yup.object({}),
];
