import dayjs from 'dayjs';
import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

const MIN_DOB = dayjs('1947-01-01');

export const inquiryValidationSchema = Yup.object().shape({
  inquiryNumber: Yup.string(),
  organization: Yup.string(),
  academicYear: Yup.string().required('Academic Year is required'),
  class: Yup.string().required('Class is required'),
  lastName: Yup.string().required('Last Name is required'),
  firstName: Yup.string().required('First Name is required'),
  middleName: Yup.string(),
  dateOfBirth: Yup.mixed()
    .test(
      'is-valid-dayjs',
      'Date of Birth is required',
      (value) => value && dayjs(value as any).isValid()
    )
    .test(
      'min-date',
      `Date of Birth is not valid`,
      (value) => value && dayjs(value as string | number | Date).isAfter(MIN_DOB.subtract(1, 'day'))
    )
    .test(
      'min-age',
      'Age must be at least 3 years',
      (value) => value && dayjs().diff(dayjs(value as string | number | Date), 'year') >= 3
    )
    .required('Date of Birth is required'),
  // dateOfBirth: Yup.date().required('Date of Birth is required'),
  age: Yup.string().required('Age is required'),
  dateOfInquiry: Yup.mixed()
    .test(
      'is-valid-dayjs',
      'Date of Inquiry is required',
      (value) => value && dayjs(value as any).isValid()
    )
    .required('Date of Inquiry is required'),
  // dateOfInquiry: Yup.date().required('Date of inquiry is required'),
  email: Yup.string().matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Please enter a valid email'
  ),
  gender: Yup.string()
    // .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  address: Yup.string(),
  primaryContactNumber: Yup.string()
    .test('Mobile NO', 'Primary Contact No. is not valid', (value) =>
      value ? matchIsValidTel((value || '') as string) : true
    )
    .required('Primary Contact No. is required'),
  secondaryContactNumber: Yup.string()
    .nullable()
    .test('Mobile NO', 'Secondary Contact No. is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )
    .test(
      'unique',
      'Secondary Contact No. cannot be same as primary contact no.',
      // eslint-disable-next-line func-names
      function (value) {
        return !value || value !== this.parent.primaryContactNumber;
      }
    ),
  previousSchool: Yup.string(),
  inquiryPreferences: Yup.string(),
  pinCode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),

  board: Yup.string().required('Board is required'),
  medium: Yup.string().required('Medium is required'),
  // country: Yup.object()
  //   .nullable()
  //   .required('Country is required')
  //   .shape({
  //     name: Yup.string().required('Country is required'),
  //   }),

  // state: Yup.object()
  //   .nullable()
  //   .required('State is required') // handles `null` case
  //   .shape({
  //     name: Yup.string().required('State is required'), // handles `{ name: '' }`
  //   }),

  // city: Yup.object()
  //   .nullable()
  //   .required('City is required')
  //   .shape({
  //     name: Yup.string().required('City is required'),
  //   }),

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
});
