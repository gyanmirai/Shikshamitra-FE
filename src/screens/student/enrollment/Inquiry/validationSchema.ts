import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

export const inquiryValidationSchema = Yup.object().shape({
  inquiryNumber: Yup.string(),
  organization: Yup.string(),
  academicYear: Yup.string().required('Academic Year is required'),
  class: Yup.string().required('Class is required'),
  lastName: Yup.string().required('Last name is required'),
  firstName: Yup.string().required('First name is required'),
  middleName: Yup.string(),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  age: Yup.string().required('Age is required'),
  dateOfInquiry: Yup.date().required('Date of inquiry is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  gender: Yup.string()
    // .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
  address: Yup.string(),
  parentsContactNo: Yup.string()
    .test('Mobile NO', 'Parents ContactNo is not valid', (value) =>
      matchIsValidTel((value || '') as string)
    )
    .required('Parents contact number is required'),
  alternateContactDetails: Yup.string()
    .test('Mobile NO', 'ContactNo is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )
    .test(
      'unique',
      'Alternate contact number cannot be same as parents contact number',
      function (value) {
        return !value || value !== this.parent.parentsContactNo;
      }
    ),
  previousSchool: Yup.string(),
  inquiryPreferences: Yup.string(),
  pinCode: Yup.number()
    .test('picode', 'Must be exactly 6 numbers', (value) => !!`${value}`.match(/\b\d{6}\b/))
    .required('Pin code is required'),

  board: Yup.string().required('Board is required'),
  medium: Yup.string().required('Medium is required'),

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
