import dayjs from 'dayjs';
import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

// validation schema for student registration
// Validates various student-specific information and characteristics

export const generalFieldValidation = Yup.object({
  inquiryNo: Yup.string(),
  formNo: Yup.string().required('Form No. is required'),
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  middleName: Yup.string(),
  dateOfBirth: Yup.mixed()
    .test(
      'is-valid-dayjs',
      'Date of Birth is required',
      (value) => value && dayjs(value as any).isValid()
    )
    .required('Date of Birth is required'),
  // dob: Yup.date().required('Date of Birth is required'),
  age: Yup.string(),
  gender: Yup.string().required('Gender is required'),
  adharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  religion: Yup.string(),
  familyCast: Yup.string().required('Family Cast is required'),
  castCategory: Yup.string()

    .required('Cast Category is required'),
  motherTongue: Yup.string(),
  nationality: Yup.string(),
  birthPlace: Yup.string(),

  remarks: Yup.string(),
  primaryContactNumber: Yup.string()
    .test('primaryContactNumber', 'Primary contact no. is not valid', (value) => {
      console.log(value, '=========>');
      return value ? matchIsValidTel(value as string) : true;
    })
    .required('Primary Contact no. is required'),
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
  addressLine1: Yup.string().required('Building No./Flat/ House No. is required'),
  addressLine2: Yup.string().required('Area/Locality/Road Name is required'),
  // alternativeContactNumber: Yup.string()
  //   .test('Mobile NO', 'mobile number is not valid', (value) =>
  //     value ? matchIsValidTel(value as string) : true
  //   )

  //   .test('unique', 'Alternate contact number cannot be same as contact number', function (value) {
  //     return !value || value !== this.parent.mobileNo;
  //   }),
  email: Yup.string().email('Invalid email format'),
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
  fatherName: Yup.string().required('Father name is required'),
  fatherDob: Yup.string().required('Father Date of Birth is Required').nullable(),
  fatherOccupation: Yup.string(),
  fatherQualification: Yup.string(),
  fatherContactNo: Yup.string().test('Mobile NO', 'Contact No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  fatherEmail: Yup.string().email('Invalid email format'),
  fatherPassOutYear: Yup.string(),
  fatherOfficeNo: Yup.string().test('Mobile NO', 'Office No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  fatherOfficeAddress1: Yup.string(),
  fatherOfficeAddress2: Yup.string(),
  fatherOfficeAddress3: Yup.string(),
  fatherDesignation: Yup.string(),
  fatherOrganization: Yup.string(),
  fatherAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  fatherRemarks: Yup.string(),
  fatherAddress1: Yup.string(),
  fatherAddress2: Yup.string(),
  fatherAddress3: Yup.string(),
  motherName: Yup.string().required('Mother name is required'),
  motherDob: Yup.string().required('Mother DOB is Required').nullable(),
  motherOccupation: Yup.string(),
  motherQualification: Yup.string(),
  motherContactNo: Yup.string().test('Mobile NO', 'Contact No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  motherEmail: Yup.string().email('Invalid email format'),
  motherPassOutYear: Yup.string(),
  motherOfficeNo: Yup.string().test('Mobile NO', 'Office No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  motherOfficeAddress1: Yup.string(),
  motherOfficeAddress2: Yup.string(),
  motherOfficeAddress3: Yup.string(),
  motherDesignation: Yup.string(),
  motherOrganization: Yup.string(),
  motherAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  motherRemarks: Yup.string(),
  motherAddress1: Yup.string(),
  motherAddress2: Yup.string(),
  motherAddress3: Yup.string(),
  guardianName: Yup.string(),
  guardianDob: Yup.string().required('Guardian DOB is Required').nullable(),
  guardianOccupation: Yup.string(),
  guardianQualification: Yup.string(),
  guardianContactNo: Yup.string().test('Mobile NO', 'Contact No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  guardianEmail: Yup.string().email('Invalid email format'),
  guardianPassOutYear: Yup.string(),
  guardianOfficeNo: Yup.string().test('Mobile NO', 'Office No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  guardianOfficeAddress1: Yup.string(),
  guardianOfficeAddress2: Yup.string(),
  guardianOfficeAddress3: Yup.string(),
  guardianDesignation: Yup.string(),
  guardianOrganization: Yup.string(),
  guardianAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  guardianRemarks: Yup.string(),
  guardianAddress1: Yup.string(),
  guardianAddress2: Yup.string(),
  guardianAddress3: Yup.string(),
});

export const communicationFieldsValidation = Yup.object({
  primaryContactNumber: Yup.string()
    .nullable()
    .test('primaryContactNumber', 'Primary Contact No. is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    ),
  secondaryContactNumber: Yup.string()
    .nullable()
    .test('secondaryContactNumber', 'Secondary Contact No. is not valid', (value) =>
      value?.replace('+91', '') ? matchIsValidTel(value as string) : true
    ),
  parentEmail: Yup.string().email('Invalid email format'),
  studentContactNo: Yup.string().test('Mobile NO', 'Student Contact No. is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  studentEmail: Yup.string().email('Invalid email format'),
  whatsAppContactNo: Yup.string().test('Mobile NO', 'WhatsApp No. is not valid', (value) =>
    value?.replace('+91', '') ? matchIsValidTel(value as string) : true
  ),
  // localCountry: Yup.object({
  //   name: Yup.string().required('Country is required'),
  // }),
  // localState: Yup.object({
  //   name: Yup.string().required('State is required'),
  // }),
  // localCity: Yup.object({
  //   name: Yup.string().required('City is required'),
  // }),
  localPincode: Yup.string(),
  localAddressLine1: Yup.string(),
  localAddressLine2: Yup.string(),
  localAddressLine3: Yup.string(),
  isOpenLocalAddress: Yup.boolean(),
  // emergencyCountry: Yup.object({
  //   name: Yup.string().required('Country is required'),
  // }),
  // emergencyState: Yup.object({
  //   name: Yup.string().required('State is required'),
  // }),
  // emergencyCity: Yup.object({
  //   name: Yup.string().required('City is required'),
  // }),
  emergencyPincode: Yup.string(),
  emergencyAddressLine1: Yup.string(),
  emergencyAddressLine2: Yup.string(),
  emergencyAddressLine3: Yup.string(),
  emergencySameAsLocal: Yup.boolean(),
  isOpenEmergencyAddress: Yup.boolean(),
  permanentAddress: Yup.string(),
  permanentAddressLine2: Yup.string(),
  permanentAddressLine3: Yup.string(),
  // permanentCountry: Yup.object({
  //   name: Yup.string().required('Country is required'),
  // }),
  // permanentState: Yup.object({
  //   name: Yup.string().required('State is required'),
  // }),
  // permanentCity: Yup.object({
  //   name: Yup.string().required('City is required'),
  // }),
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
  emergencyContactNo: Yup.string().test(
    'Mobile NO',
    'Emergency Contact No. is not valid',
    (value) => (value ? matchIsValidTel(value as string) : true)
  ),
  relationName: Yup.string(),
  relation: Yup.string(),
  singleParentChild: Yup.boolean(),
  singleChild: Yup.boolean(),
  // sponsorStudent: Yup.boolean(),
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
  childImmunisation: Yup.boolean(),
  immunisationRemarks: Yup.string(),
});
export const previousSchoolValidation = Yup.object({
  schoolName: Yup.string(),
  schoolAddress: Yup.string(),
  schoolBoard: Yup.string(),
  schoolMedium: Yup.string(),
  tcNumber: Yup.string(),
  lastClassPassed: Yup.string(),
  percentage: Yup.string(),
});

export const bankDetailsValidation = Yup.object({
  bankName: Yup.string(),
  accountNo: Yup.string(),
  ifscCode: Yup.string(),
  branchName: Yup.string(),
  accountHolderName: Yup.string(),
});

// Array of validation schemas for different sections of the student registration form
// Index 0: General fields validation (student basic details)
// Index 1: Empty object for future use or placeholder
// Index 2: Family details validation (parent/guardian information)
// Index 3: Communication details validation (address and contact info)
// Index 4: Additional details validation (category, RTE, emergency contacts)
// Index 5: Medical details validation (health and immunization records)
// Index 6: Previous school details validation (academic history)
// Index 7: Bank details validation (financial information)
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
