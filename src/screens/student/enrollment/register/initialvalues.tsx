import dayjs from 'dayjs';
import { GenderType } from 'src/enums/gender';
import calculateAge from 'src/utils/calculate-age';
import { Category } from 'src/enums/studnet-category';
import { convertBase64Format } from 'src/utils/base64Formate';
import { validatePhoneNumber } from 'src/utils/validate-phone-number';

import type { IInquiryData } from '../Inquiry';

export const generalFieldsInitialValues = (editData?: IInquiryData | null) => ({
  inquiryNo: editData?.inquiryNumber || '',
  formNo: editData?.formNumber || '',
  firstName: editData?.firstName || '',
  lastName: editData?.lastName || '',
  middleName: editData?.middleName || '',
  dob: editData?.dateOfBirth ? dayjs(editData?.dateOfBirth) : null,
  age: editData?.dateOfBirth ? calculateAge(dayjs(editData.dateOfBirth).format()) : '',
  gender: editData?.genderType || GenderType.Male,
  adharNo: editData?.aadhaarNo || '',
  religion: editData?.religion || '',
  familyCast: editData ? editData?.familyCast : '',
  castCategory: editData ? editData?.castType : null,
  motherTongue: editData?.motherTongue || '',
  nationality: editData?.nationality || 'Indian',
  birthPlace: editData?.birthPlace || '',
  temporaryGr: editData?.temporaryGr || '',
  remarks: editData?.remarks || '',
  primaryContactNumber: editData?.primaryContactNumber || '',
  secondaryContactNumber: editData?.secondaryContactNumber
    ? validatePhoneNumber(editData?.secondaryContactNumber)
    : '',
  email: editData?.email || '',
  userId: editData?.userId || null,
  id: editData?.id || null,
  medium: editData?.educationMediumId || '',
  board: editData?.educationBoardId || '',
  academicYear: editData?.academicYearId || '',
  class: editData?.standardId || '',
  previousSchool: editData?.previousSchoolName || '',
  photo: editData?.profilePicture ? convertBase64Format(editData?.profilePicture) : '',
  city: editData?.city ? { name: editData?.city } : { name: '' },
  state: editData?.state
    ? { name: editData?.state?.name, isoCode: editData?.state?.isoCode }
    : { name: '', isoCode: '' },
  country: editData?.country
    ? { name: editData?.country?.name, isoCode: editData?.country?.isoCode }
    : { name: 'India', isoCode: 'IN' },
  addressLine1: editData?.addressLine1 || '',

  addressLine2: editData?.addressLine2 || '',
  addressLine3: editData?.addressLine3 || '',
  pinCode: editData?.pinCode || '',
  inquiryPreference: editData?.inquiryPreferenceId || null,
  apparId: editData?.apparId || '',
  panNo: editData?.panNo || '',
  lastClassPassed: editData?.lastClassPassed || '',
});
export const documentFieldsInitialValues = (editData?: IInquiryData | null) => ({
  documents: [],
});

export const familyFieldsInitialValues = (editData?: IInquiryData | null) => ({
  fatherName: editData?.fatherDetails?.name || '',
  fatherDob: editData?.fatherDetails?.dateOfBirth
    ? dayjs(editData?.fatherDetails.dateOfBirth)
    : null,
  fatherOccupation: editData?.fatherDetails?.occupation || '',
  fatherQualification: editData?.fatherDetails?.qualification || '',
  fatherContactNo: editData?.fatherDetails?.contactNo
    ? validatePhoneNumber(editData?.fatherDetails?.contactNo)
    : '',
  fatherEmail: editData?.fatherDetails?.email || '',
  fatherPassOutYear: editData?.fatherDetails?.passOutYear || '',
  fatherOfficeNo: editData?.fatherDetails?.officeNo || '',
  fatherDesignation: editData?.fatherDetails?.designation || '',
  fatherOrganization: editData?.fatherDetails?.organisation || '',
  fatherAadharNo: editData?.fatherDetails?.aadhaarNo || '',
  fatherRemarks: editData?.fatherDetails?.remarks || '',
  fatherAddress1: editData?.fatherDetails?.address1 || '',
  fatherAddress2: editData?.fatherDetails?.address2 || '',
  fatherAddress3: editData?.fatherDetails?.address3 || '',
  fatherOfficeAddress1: editData?.fatherDetails?.officeAddress1 || '',
  fatherOfficeAddress2: editData?.fatherDetails?.officeAddress2 || '',
  fatherOfficeAddress3: editData?.fatherDetails?.officeAddress3 || '',
  fatherLocalCountry: editData?.fatherDetails?.localCountry?.name
    ? {
        name: editData?.fatherDetails?.localCountry?.name || '',
        isoCode: editData?.fatherDetails?.localCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  fatherLocalState: editData?.fatherDetails?.localState?.name
    ? {
        name: editData?.fatherDetails?.localState?.name || '',
        isoCode: editData?.fatherDetails?.localState?.isoCode || '',
      }
    : { name: '', isoCode: '' },
  fatherLocalCity: {
    name: editData?.fatherDetails?.localCity || '',
  },
  fatherLocalPincode: editData?.fatherDetails?.localPincode || '',
  fatherOfficeCountry: editData?.fatherDetails?.officeCountry?.name
    ? {
        name: editData?.fatherDetails?.officeCountry?.name || '',
        isoCode: editData?.fatherDetails?.officeCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  fatherOfficeState: {
    name: editData?.fatherDetails?.officeState?.name || '',
    isoCode: editData?.fatherDetails?.officeState?.isoCode || '',
  },
  fatherOfficeCity: {
    name: editData?.fatherDetails?.officeCity || '',
  },
  fatherOfficePincode: editData?.fatherDetails?.officePincode || '',

  motherName: editData?.motherDetails?.name || '',
  motherDob: editData?.motherDetails?.dateOfBirth
    ? dayjs(editData?.motherDetails.dateOfBirth)
    : null,
  motherOccupation: editData?.motherDetails?.occupation || '',
  motherQualification: editData?.motherDetails?.qualification || '',
  motherContactNo: editData?.motherDetails?.contactNo
    ? validatePhoneNumber(editData?.motherDetails?.contactNo)
    : '',
  motherEmail: editData?.motherDetails?.email || '',
  motherPassOutYear: editData?.motherDetails?.passOutYear || '',
  motherOfficeNo: editData?.motherDetails?.officeNo || '',
  motherOfficeAddress1: editData?.motherDetails?.officeAddress1 || '',
  motherOfficeAddress2: editData?.motherDetails?.officeAddress2 || '',
  motherOfficeAddress3: editData?.motherDetails?.officeAddress3 || '',
  motherDesignation: editData?.motherDetails?.designation || '',
  motherOrganization: editData?.motherDetails?.organisation || '',
  motherAadharNo: editData?.motherDetails?.aadhaarNo || '',
  motherRemarks: editData?.motherDetails?.remarks || '',
  motherAddress1: editData?.motherDetails?.address1 || '',
  motherAddress2: editData?.motherDetails?.address2 || '',
  motherAddress3: editData?.motherDetails?.address3 || '',
  motherLocalCountry: editData?.motherDetails?.localCountry?.name
    ? {
        name: editData?.motherDetails?.localCountry?.name || '',
        isoCode: editData?.motherDetails?.localCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  motherLocalState: editData?.motherDetails?.localState?.name
    ? {
        name: editData?.motherDetails?.localState?.name || '',
        isoCode: editData?.motherDetails?.localState?.isoCode || '',
      }
    : { name: '', isoCode: '' },
  motherLocalCity: {
    name: editData?.motherDetails?.localCity || '',
  },
  motherLocalPincode: editData?.motherDetails?.localPincode || '',
  motherOfficeCountry: editData?.motherDetails?.officeCountry?.name
    ? {
        name: editData?.motherDetails?.officeCountry?.name || '',
        isoCode: editData?.motherDetails?.officeCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  motherOfficeState: {
    name: editData?.motherDetails?.officeState?.name || '',
    isoCode: editData?.motherDetails?.officeState?.isoCode || '',
  },
  motherOfficeCity: {
    name: editData?.motherDetails?.officeCity || '',
  },
  motherOfficePincode: editData?.motherDetails?.officePincode || '',
  guardianName: editData?.guardianDetails?.name || '',
  guardianDob: editData?.guardianDetails?.dateOfBirth
    ? dayjs(editData?.guardianDetails.dateOfBirth)
    : null,
  guardianOccupation: editData?.guardianDetails?.occupation || '',
  guardianQualification: editData?.guardianDetails?.qualification || '',
  guardianContactNo: editData?.guardianDetails?.contactNo
    ? validatePhoneNumber(editData?.guardianDetails?.contactNo)
    : '',
  guardianEmail: editData?.guardianDetails?.email || '',
  guardianPassOutYear: editData?.guardianDetails?.passOutYear || '',
  guardianOfficeNo: editData?.guardianDetails?.officeNo || '',
  guardianOfficeAddress1: editData?.guardianDetails?.officeAddress1 || '',
  guardianOfficeAddress2: editData?.guardianDetails?.officeAddress2 || '',
  guardianOfficeAddress3: editData?.guardianDetails?.officeAddress3 || '',
  guardianDesignation: editData?.guardianDetails?.designation || '',
  guardianOrganization: editData?.guardianDetails?.organisation || '',
  guardianAadharNo: editData?.guardianDetails?.aadhaarNo || '',
  guardianRemarks: editData?.guardianDetails?.remarks || '',
  guardianAddress1: editData?.guardianDetails?.address1 || '',
  guardianAddress2: editData?.guardianDetails?.address2 || '',
  guardianAddress3: editData?.guardianDetails?.address3 || '',
  guardianLocalCountry: editData?.guardianDetails?.localCountry?.name
    ? {
        name: editData?.guardianDetails?.localCountry?.name || '',
        isoCode: editData?.guardianDetails?.localCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  guardianLocalState: {
    name: editData?.guardianDetails?.localState?.name || '',
    isoCode: editData?.guardianDetails?.localState?.isoCode || '',
  },
  guardianLocalCity: {
    name: editData?.guardianDetails?.localCity || '',
  },
  guardianLocalPincode: editData?.guardianDetails?.localPincode || '',

  guardianOfficeCountry: editData?.guardianDetails?.officeCountry?.name
    ? {
        name: editData?.guardianDetails?.officeCountry?.name || '',
        isoCode: editData?.guardianDetails?.officeCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  guardianOfficeState: {
    name: editData?.guardianDetails?.officeState?.name || '',
    isoCode: editData?.guardianDetails?.officeState?.isoCode || '',
  },
  guardianOfficeCity: {
    name: editData?.guardianDetails?.officeCity || '',
  },
  guardianOfficePincode: editData?.guardianDetails?.officePincode || '',
});

export const CommunicationFieldsInitialValues = (editData?: IInquiryData | null) => ({
  commPrimaryContactNumber: editData?.studentCommunicationDetails?.primaryContactNo || '',
  parentContactNumber: editData?.studentCommunicationDetails?.parentContactNo
    ? validatePhoneNumber(editData?.studentCommunicationDetails?.parentContactNo)
    : '',
  parentEmail: editData?.studentCommunicationDetails?.parentEmail || '',
  studentContactNo: editData?.studentCommunicationDetails?.studentContactNo || '',
  studentEmail: editData?.studentCommunicationDetails?.studentEmail || '',
  whatsAppContactNo: editData?.studentCommunicationDetails?.whatsAppNo
    ? validatePhoneNumber(editData?.studentCommunicationDetails?.whatsAppNo)
    : '',

  localCountry: editData?.studentCommunicationDetails?.localCountry?.name
    ? {
        name: editData?.studentCommunicationDetails?.localCountry?.name || '',
        isoCode: editData?.studentCommunicationDetails?.localCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  localState: {
    name: editData?.studentCommunicationDetails?.localState?.name || '',
    isoCode: editData?.studentCommunicationDetails?.localState?.isoCode || '',
  },
  localCity: {
    name: editData?.studentCommunicationDetails?.localCity?.name || '',
  },
  localPincode: editData?.studentCommunicationDetails?.localPinCode || '',
  localAddressLine1: editData?.studentCommunicationDetails?.localAddressLine1 || '',
  localAddressLine2: editData?.studentCommunicationDetails?.localAddressLine2 || '',
  localAddressLine3: editData?.studentCommunicationDetails?.localAddressLine3 || '',
  isOpenLocalAddress: true,
  sameAsStudentForLocal: false,
  emergencyCountry: editData?.studentCommunicationDetails?.emergencyCountry?.name
    ? {
        name: editData?.studentCommunicationDetails?.emergencyCountry?.name || '',
        isoCode: editData?.studentCommunicationDetails?.emergencyCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  emergencyState: {
    name: editData?.studentCommunicationDetails?.emergencyState?.name || '',
    isoCode: editData?.studentCommunicationDetails?.emergencyState?.isoCode || '',
  },
  emergencyCity: { name: editData?.studentCommunicationDetails?.emergencyCity?.name || '' },
  emergencyPincode: editData?.studentCommunicationDetails?.emergencyPinCode || '',
  emergencyAddressLine1: editData?.studentCommunicationDetails?.emergencyAddressLine1 || '',
  emergencyAddressLine2: editData?.studentCommunicationDetails?.emergencyAddressLine2 || '',
  emergencyAddressLine3: editData?.studentCommunicationDetails?.emergencyAddressLine3 || '',
  emergencySameAsLocal: false,
  isOpenEmergencyAddress: true,

  permanentAddress: editData?.studentCommunicationDetails?.permanentAddressLine1 || '',
  permanentAddressLine2: editData?.studentCommunicationDetails?.permanentAddressLine2 || '',
  permanentAddressLine3: editData?.studentCommunicationDetails?.permanentAddressLine3 || '',
  permanentCountry: editData?.studentCommunicationDetails?.permanentCountry?.name
    ? {
        name: editData?.studentCommunicationDetails?.permanentCountry?.name || '',
        isoCode: editData?.studentCommunicationDetails?.permanentCountry?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  permanentState: {
    name: editData?.studentCommunicationDetails?.permanentState?.name || '',
    isoCode: editData?.studentCommunicationDetails?.permanentState?.isoCode || '',
  },
  permanentCity: { name: editData?.studentCommunicationDetails?.permanentCity?.name || '' },
  permanentPincode: editData?.studentCommunicationDetails?.permanentPinCode || '',
  sameAsLocalForPermanent: false,
  isOpenPermanentAddress: true,

  remarks: editData?.studentCommunicationDetails?.remarks || '',
});

export const additionalDetailsInitialValues = (editData?: IInquiryData | null) => ({
  category: editData?.studentAdditionalDetails?.category || Category.General,
  RTE: editData?.studentAdditionalDetails?.category !== Category.General,
  bplStudent: editData?.studentAdditionalDetails?.bplStudent || false,
  bplCardNo: editData?.studentAdditionalDetails?.bplCardNo || '',
  personWithDisability: editData?.studentAdditionalDetails?.personWithDisability || false,
  secondLanguage: editData?.studentAdditionalDetails?.secondLanguage || '',
  emergencyContactNo: editData?.studentAdditionalDetails?.emergencyContactNo
    ? validatePhoneNumber(editData?.studentAdditionalDetails?.emergencyContactNo)
    : '',
  relationName: editData?.studentAdditionalDetails?.relationName || '',
  relation: editData?.studentAdditionalDetails?.relation || '',
  singleParentChild: editData?.studentAdditionalDetails?.singleParentChild || false,
  singleChild: editData?.studentAdditionalDetails?.singleChild || false,
  sponsorStudent: '',
  sponsorName: editData?.studentAdditionalDetails?.sponsorName || '',
});

export const medicalFieldsInitialValues = (editData?: IInquiryData | null) => ({
  weight: editData?.studentMedicalRecords?.weight || '',
  height: editData?.studentMedicalRecords?.height || '',
  bmi: editData?.studentMedicalRecords?.bodyMassIndex || '',
  pulseRate: '',
  haemoglobin: editData?.studentMedicalRecords?.haemoglobin || '',
  allergies: editData?.studentMedicalRecords?.allergies || '',
  covidVaccination: editData?.studentMedicalRecords?.covidVaccination || '',
  childImmunisation: editData?.studentMedicalRecords?.childImmunisation || '',
  immunisationRemarks: editData?.studentMedicalRecords?.immunisationRemarks || '',
});

export const previousSchoolFieldsInitialValues = (editData?: IInquiryData | null) => ({
  schoolName: editData?.previousSchoolDetails?.previousSchoolName || '',
  schoolAddress: editData?.previousSchoolDetails?.previousSchoolAddress || '',
  schoolBoard: editData?.previousSchoolDetails?.previousSchoolBoard || '',
  schoolMedium: editData?.previousSchoolDetails?.previousSchoolMedium || '',
  tcNumber: editData?.previousSchoolDetails?.tcNo || '',
  lastClassPassed: editData?.previousSchoolDetails?.lastClassPassed || '',
  percentage: editData?.previousSchoolDetails?.percentage || '',
});

export const bankDetailsInitialValues = (editData?: IInquiryData | null) => ({
  bankName: editData?.parentBankDetails?.bankName || '',
  accountNo: editData?.parentBankDetails?.accountNumber || '',
  ifscCode: editData?.parentBankDetails?.ifscCode || '',
  branchName: editData?.parentBankDetails?.branchName || '',
  accountHolderName: editData?.parentBankDetails?.accountHolderName || '',
});
