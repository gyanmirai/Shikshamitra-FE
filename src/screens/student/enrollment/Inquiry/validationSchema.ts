import dayjs from 'dayjs';
import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

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
  email: Yup.string().email('Invalid email'),
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
      function (value) {
        return !value || value !== this.parent.primaryContactNumber;
      }
    ),
  previousSchool: Yup.string(),
  inquiryPreferences: Yup.string(),
  pinCode: Yup.number()
    .test('picode', 'Must be exactly 6 numbers', (value) =>
      value ? !!`${value}`.match(/\b\d{6}\b/) : true
    )
    .nullable(),

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
