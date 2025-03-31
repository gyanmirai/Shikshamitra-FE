import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

const generalFieldValidation = Yup.object({
  inquiryNo: Yup.string(),
  formNo: Yup.string().required('Form No is required'),
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  middleName: Yup.string().required('Middle Name is required'),
  dob: Yup.date().required('Date of Birth is required'),
  age: Yup.string(),
  gender: Yup.string().required('Gender is required'),
  adharNo: Yup.string()
    .matches(/^\d{12}$/, 'Adhar number must be 12 digits')
    .required('Adhar No is required'),
  religion: Yup.string(),
  familyCast: Yup.string(),
  castCategory: Yup.string()

    .required('Cast Category is required'),
  motherTongue: Yup.string(),
  nationality: Yup.string(),
  birthPlace: Yup.string(),
  temporaryGr: Yup.string(),
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
});

const familyFieldsValidation = Yup.object({
  fatherName: Yup.string().required('Father name is required'),
  fatherDob: Yup.string().nullable(),
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
  motherDob: Yup.string().nullable(),
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
  guardianDob: Yup.string().nullable(),
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
