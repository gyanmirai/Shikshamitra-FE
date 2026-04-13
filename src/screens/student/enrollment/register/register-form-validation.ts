import dayjs from 'dayjs';
import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

// validation schema for student registration
// Validates various student-specific information and characteristics
const MIN_DOB = dayjs('1947-01-01');

export const generalFieldValidation = Yup.object({
  inquiryNo: Yup.string(),
  formNo: Yup.string().required('Form No. is required'),
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  middleName: Yup.string(),
  dob: Yup.mixed()
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
      'max-date',
      `Date of Birth is not valid`,
      (value) => value && dayjs(value as string | number | Date).isBefore(dayjs())
    )
    .required('Date of Birth is required'),
  age: Yup.string(),
  gender: Yup.string().required('Gender is required'),
  apparId: Yup.string().matches(/\b\d{12}\b/, 'Appar Id must be 12 digits'),
  adharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  panNo: Yup.string().test(
    'pan-format',
    'PAN must be in format: AAAAA9999A (5 letters, 4 digits, 1 letter)',
    (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)
  ),
  religion: Yup.string(),
  familyCast: Yup.string().required('Family caste is required'),
  castCategory: Yup.string().required('Cast Category is required'),
  motherTongue: Yup.string(),
  nationality: Yup.string(),
  birthPlace: Yup.string(),

  remarks: Yup.string(),
  primaryContactNumber: Yup.string()
    .test('primaryContactNumber', 'Primary contact No. is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )
    .required('Primary Contact No. is required'),
  secondaryContactNumber: Yup.string()
    .nullable()
    .test('Mobile NO', 'Secondary Contact No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    })
    .test(
      'unique',
      'Secondary Contact No. cannot be same as primary contact no.',
      // eslint-disable-next-line func-names
      function (value) {
        return !value || value !== this.parent.primaryContactNumber;
      }
    ),
  pinCode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),

  addressLine1: Yup.string().required('Building/Flat/House No. is required'),
  addressLine2: Yup.string().required('Area/Locality/Road Name is required'),
  email: Yup.string().email('Invalid email address'),
  medium: Yup.string().required('Medium is required'),
  board: Yup.string().required('Board is required'),
  academicYear: Yup.string().required('Academic Year is required'),
  class: Yup.string().required('Class is required'),
  previousSchool: Yup.string(),
  photo: Yup.string(),
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

export const familyFieldsValidation = Yup.object({
  fatherName: Yup.string().required('Full Name is required'),
  fatherDob: Yup.string().required('Father Date of Birth is Required').nullable(),
  fatherOccupation: Yup.string(),
  fatherQualification: Yup.string(),
  fatherContactNo: Yup.string()
    .nullable()
    .test('Mobile NO', 'Contact No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    }),
  fatherEmail: Yup.string().matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Please enter a valid email'
  ),
  fatherPassOutYear: Yup.string()
    .nullable()
    .test('is-valid-year', 'Invalid year', (value) => {
      if (!value) return true;
      const year = parseInt(value, 10);
      return year >= 1947 && year <= new Date().getFullYear();
    }),
  fatherOfficeNo: Yup.string()
    .nullable()
    .test('Mobile NO', 'Office No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    }),
  fatherOfficeAddress1: Yup.string(),
  fatherOfficeAddress2: Yup.string(),
  fatherOfficeAddress3: Yup.string(),
  fatherDesignation: Yup.string(),
  fatherOrganization: Yup.string(),
  fatherAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  fatherOfficePincode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),
  fatherLocalPincode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),
  fatherRemarks: Yup.string(),
  fatherAddress1: Yup.string(),
  fatherAddress2: Yup.string(),
  fatherAddress3: Yup.string(),
  motherName: Yup.string().required('Full Name is required'),
  motherDob: Yup.string().required('Mother DOB is Required').nullable(),
  motherOccupation: Yup.string(),
  motherQualification: Yup.string(),
  motherContactNo: Yup.string()
    .nullable()
    .test('Mobile NO', 'Contact No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    }),
  motherEmail: Yup.string().matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Please enter a valid email'
  ),
  motherPassOutYear: Yup.string()
    .nullable()
    .test('is-valid-year', 'Invalid year', (value) => {
      if (!value) return true;
      const year = parseInt(value, 10);
      return year >= 1947 && year <= new Date().getFullYear();
    }),
  motherOfficeNo: Yup.string()
    .nullable()
    .test('Mobile NO', 'Office No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    }),
  motherOfficeAddress1: Yup.string(),
  motherOfficeAddress2: Yup.string(),
  motherOfficeAddress3: Yup.string(),
  motherDesignation: Yup.string(),
  motherOrganization: Yup.string(),
  motherAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  motherOfficePincode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),
  motherLocalPincode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),
  motherRemarks: Yup.string(),
  motherAddress1: Yup.string(),
  motherAddress2: Yup.string(),
  motherAddress3: Yup.string(),
  guardianName: Yup.string(),
  guardianDob: Yup.string().required('Guardian DOB is Required').nullable(),
  guardianOccupation: Yup.string(),
  guardianQualification: Yup.string(),
  guardianContactNo: Yup.string()
    .nullable()
    .test('Mobile NO', 'Contact No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    }),
  guardianEmail: Yup.string().matches(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    'Please enter a valid email'
  ),
  guardianPassOutYear: Yup.string()
    .nullable()
    .test('is-valid-year', 'Invalid year', (value) => {
      if (!value) return true;
      const year = parseInt(value, 10);
      return year >= 1947 && year <= new Date().getFullYear();
    }),
  guardianOfficeNo: Yup.string()
    .nullable()
    .test('Mobile NO', 'Office No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    }),
  guardianOfficeAddress1: Yup.string(),
  guardianOfficeAddress2: Yup.string(),
  guardianOfficeAddress3: Yup.string(),
  guardianDesignation: Yup.string(),
  guardianOrganization: Yup.string(),
  guardianAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  guardianOfficePincode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),
  guardianLocalPincode: Yup.string()
    .nullable()
    .test('pincode-length', 'PIN code must be exactly 6 digits', (value) =>
      value ? /^\d{6}$/.test(value) : true
    )
    .test('pincode-start', 'PIN code cannot start with 0', (value) =>
      value ? !/^0/.test(value) : true
    ),
  guardianRemarks: Yup.string(),
  guardianAddress1: Yup.string(),
  guardianAddress2: Yup.string(),
  guardianAddress3: Yup.string(),
});

export const communicationFieldsValidation = Yup.object({
  commPrimaryContactNumber: Yup.string()
    .nullable()
    .test('commPrimaryContactNumber', 'Primary Contact No. is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    ),
  secondaryContactNumber: Yup.string()
    .nullable()
    .test('secondaryContactNumber', 'Secondary Contact No. is not valid', (value) =>
      value?.replace('+91', '') ? matchIsValidTel(value as string) : true
    ),
  parentEmail: Yup.string().email('Invalid email address'),
  studentContactNo: Yup.string().test('Mobile NO', 'Student Contact No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  studentEmail: Yup.string().email('Invalid email address'),
  whatsAppContactNo: Yup.string().test('Mobile NO', 'WhatsApp No. is not valid', (value) =>
    value?.replace('+91', '') ? matchIsValidTel(value as string) : true
  ),
  localPincode: Yup.string(),
  localAddressLine1: Yup.string(),
  localAddressLine2: Yup.string(),
  localAddressLine3: Yup.string(),
  isOpenLocalAddress: Yup.boolean(),
  emergencyPincode: Yup.string(),
  emergencyAddressLine1: Yup.string(),
  emergencyAddressLine2: Yup.string(),
  emergencyAddressLine3: Yup.string(),
  emergencySameAsLocal: Yup.boolean(),
  isOpenEmergencyAddress: Yup.boolean(),
  permanentAddress: Yup.string(),
  permanentAddressLine2: Yup.string(),
  permanentAddressLine3: Yup.string(),
  permanentPincode: Yup.string(),
  sameAsLocalForPermanent: Yup.boolean(),
  isOpenPermanentAddress: Yup.boolean(),
  remarks: Yup.string(),
});

export const additionalDetailsValidations = Yup.object({
  category: Yup.string(),
  RTE: Yup.boolean(),
  bplStudent: Yup.boolean().nullable(),
  bplCardNo: Yup.string(),
  personWithDisability: Yup.boolean().nullable(),
  secondLanguage: Yup.string(),
  emergencyContactNo: Yup.string()
    .nullable()
    .test('Mobile NO', 'Emergency Contact No. is not valid', (value) => {
      const digits = value?.replace(/\D/g, '');
      const national = digits?.replace(/^91/, '');
      return value
        ? matchIsValidTel(value, { onlyCountries: ['IN'] }) && national?.length === 10
        : true;
    }),
  relationName: Yup.string(),
  relation: Yup.string(),
  singleParentChild: Yup.boolean(),
  singleChild: Yup.boolean(),
  libraryMember: Yup.boolean(),
  transportMember: Yup.boolean(),
  sponsorName: Yup.string(),
});

export const medicalDetailsValidations = Yup.object({
  weight: Yup.number(),
  height: Yup.string(),
  bmi: Yup.string(),
  pulseRate: Yup.string(),
  haemoglobin: Yup.string(),
  allergies: Yup.string(),
  covidVaccination: Yup.number()
    .required('Covid vaccination is required')
    .min(0, 'Only single digit are allowed')
    .max(9, 'Only single digit  are allowed')
    .typeError('Only single digit are allowed'),
  childImmunisation: Yup.string(),
  immunisationRemarks: Yup.string(),
});

export const previousSchoolValidation = Yup.object({
  schoolName: Yup.string(),
  schoolAddress: Yup.string(),
  schoolBoard: Yup.string(),
  schoolMedium: Yup.string(),
  tcNumber: Yup.string(),
  previousClass: Yup.string(),
  percentage: Yup.string(),
});

export const bankDetailsValidation = Yup.object({
  bankName: Yup.string(),
  accountNo: Yup.string().matches(/^\d{6,18}$/, {
    message: 'Account No. must be 6–18 digits',
    excludeEmptyString: true,
  }),
  ifscCode: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
    message: 'Invalid IFSC Code',
    excludeEmptyString: true,
  }),
  branchName: Yup.string(),
  accountHolderName: Yup.string(),
});
export const validationSchemas = [
  generalFieldValidation,
  Yup.object({}),
  familyFieldsValidation,
  communicationFieldsValidation,
  additionalDetailsValidations,
  medicalDetailsValidations,
  previousSchoolValidation,
  bankDetailsValidation,
];
