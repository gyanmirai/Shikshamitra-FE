import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

// validation schema for student registration
// Validates various student-specific information and characteristics

const generalFieldValidation = Yup.object({
  inquiryNo: Yup.string(),
  formNo: Yup.string().required('Form No is required'),
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  middleName: Yup.string(),
  dob: Yup.date().required('Date of Birth is required'),
  age: Yup.string(),
  gender: Yup.string().required('Gender is required'),
  adharNo: Yup.string()
    .matches(/^\d{12}$/, 'Adhar number must be 12 digits')
    .required('Aadhar No is required'),
  religion: Yup.string(),
  familyCast: Yup.string(),
  castCategory: Yup.string()

    .required('Cast Category is required'),
  motherTongue: Yup.string(),
  nationality: Yup.string(),
  birthPlace: Yup.string(),

  remarks: Yup.string(),
  mobileNo: Yup.string()
    .test(
      'Mobile NO',
      'mobile number is not valid',
      (value) => !!value && matchIsValidTel(value as string)
    )
    .required('Mobile number is required'),
  alternativeContactNumber: Yup.string()
    .test('Mobile NO', 'mobile number is not valid', (value) =>
      value ? matchIsValidTel(value as string) : true
    )

    .test('unique', 'Alternate contact number cannot be same as contact number', function (value) {
      return !value || value !== this.parent.mobileNo;
    }),
  email: Yup.string().email('Invalid email format').required('Email is required'),
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
  temporaryGr: Yup.string().required('Temporary GR is required'),
});

const familyFieldsValidation = Yup.object({
  fatherName: Yup.string().required('Father name is required'),
  fatherDob: Yup.string().required('Father DOB is required'),
  fatherOccupation: Yup.string(),
  fatherQualification: Yup.string(),
  fatherContactNo: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  fatherEmail: Yup.string().email('Invalid email format'),
  fatherPassOutYear: Yup.string(),
  fatherOfficeNo: Yup.string(),
  fatherOfficeAddress: Yup.string(),
  fatherDesignation: Yup.string(),
  fatherOrganization: Yup.string(),
  fatherAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  fatherRemarks: Yup.string(),
  fatherAddress: Yup.string(),

  motherName: Yup.string().required('Mother name is required'),
  motherDob: Yup.string().required('Mother DOB is required'),
  motherOccupation: Yup.string(),
  motherQualification: Yup.string(),
  motherContactNo: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  motherEmail: Yup.string().email('Invalid email format'),
  motherPassOutYear: Yup.string(),
  motherOfficeNo: Yup.string(),
  motherOfficeAddress: Yup.string(),
  motherDesignation: Yup.string(),
  motherOrganization: Yup.string(),
  motherAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  motherRemarks: Yup.string(),
  motherAddress: Yup.string(),

  guardianName: Yup.string(),
  guardianDob: Yup.string(),
  guardianOccupation: Yup.string(),
  guardianQualification: Yup.string(),
  guardianContactNo: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  guardianEmail: Yup.string().email('Invalid email format'),
  guardianPassOutYear: Yup.string(),
  guardianOfficeNo: Yup.string(),
  guardianOfficeAddress: Yup.string(),
  guardianDesignation: Yup.string(),
  guardianOrganization: Yup.string(),
  guardianAadharNo: Yup.string().matches(/^\d{12}$/, 'Adhar number must be 12 digits'),
  guardianRemarks: Yup.string(),
  guardianAddress: Yup.string(),
});

const communicationFieldsValidation = Yup.object({
  primaryContactNumber: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  parentContactNumber: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  parentEmail: Yup.string().email('Invalid email format'),
  studentContactNo: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  studentEmail: Yup.string().email('Invalid email format'),
  whatsAppContactNo: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
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

const additionalDetailsValidations = Yup.object({
  category: Yup.string(),
  RTE: Yup.boolean(),
  bplStudent: Yup.boolean().nullable(),
  bplCardNo: Yup.string(),
  personWithDisability: Yup.boolean().nullable(),
  secondLanguage: Yup.string(),
  emergencyContactNo: Yup.string().test('Mobile NO', 'mobile number is not valid', (value) =>
    value ? matchIsValidTel(value as string) : true
  ),
  singleParentChild: Yup.boolean(),
  singleChild: Yup.boolean(),
  // sponsorStudent: Yup.boolean(),
  sponsorName: Yup.string(),
});
const medicalDetailsValidations = Yup.object({
  weight: Yup.number(),
  height: Yup.string(),
  bmi: Yup.string(),
  pulseRate: Yup.string(),
  haemoglobin: Yup.string(),
  allergies: Yup.string(),
  covidVaccination: Yup.number().required('Covid vaccination is required'),
  childImmunisation: Yup.boolean(),
  immunisationRemarks: Yup.string(),
});
const previousSchoolValidation = Yup.object({
  schoolName: Yup.string(),
  schoolAddress: Yup.string(),
  schoolBoard: Yup.string(),
  schoolMedium: Yup.string(),
  tcNumber: Yup.string(),
  lastClassPassed: Yup.string(),
  percentage: Yup.string(),
});

const bankDetailsValidation = Yup.object({
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
