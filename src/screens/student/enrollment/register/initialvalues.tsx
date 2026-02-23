import type { GenderType } from 'src/enums/gender';

import dayjs from 'dayjs';
import { ReligionType } from 'src/enums/religion';
import calculateAge from 'src/utils/calculate-age';
import { Category } from 'src/enums/studnet-category';
import { convertBase64Format } from 'src/utils/base64Formate';
import { validatePhoneNumber } from 'src/utils/validate-phone-number';

import type {
  IBankDetailsResponse,
  IPreviousSchoolResponse,
  IFamilyInformationResponse,
  IGeneralInformationResponse,
  IMedicalInformationResponse,
  IAdditionalInformationResponse,
  ICommunicationInformationResponse,
} from './type';

export const generalFieldsInitialValues = (editData?: IGeneralInformationResponse | null) => ({
  inquiryNo: editData?.inquiryNo || '',
  formNo: editData?.formNo || '',
  firstName: editData?.firstName || '',
  lastName: editData?.lastName || '',
  middleName: editData?.middleName || '',
  dob: editData?.dateOfBirth ? dayjs(editData?.dateOfBirth) : null,
  age: editData?.dateOfBirth ? calculateAge(dayjs(editData.dateOfBirth).format()) : '',
  gender: editData?.gender as GenderType,
  adharNo: editData?.adharNo || '',
  religion: editData?.religion ?? ReligionType.Hinduism,
  familyCast: editData ? editData?.familyCast : '',
  castCategory: editData ? editData?.castCategory : null,
  motherTongue: editData?.motherTongue ?? undefined,
  nationality: editData?.nationality || 'Indian',
  birthPlace: editData?.birthPlace || '',
  // temporaryGr: editData?.temporaryGr || '',
  // remarks: editData?.remarks || '',
  primaryContactNumber: editData?.primaryContactNo || '',
  secondaryContactNumber: editData?.secondaryContactNo
    ? validatePhoneNumber(editData?.secondaryContactNo)
    : '',
  email: editData?.email || '',
  userId: editData?.studentId || null,
  id: editData?.studentId || null,
  medium: editData?.academicMediumId || '',
  board: editData?.academicBoardId || '',
  academicYear: editData?.academicYearId || '',
  class: editData?.standardId || '',
  previousSchool: editData?.previousSchool || '',
  photo: editData?.profilePicture ? convertBase64Format(editData?.profilePicture) : '',
  city: editData?.city ? { name: editData?.city } : { name: '' },
  state: editData?.state
    ? { name: editData?.state?.name, isoCode: editData?.state?.isoCode }
    : { name: '', isoCode: '' },
  country: editData?.country
    ? { name: editData?.country?.name, isoCode: editData?.country?.isoCode }
    : { name: 'India', isoCode: 'IN' },
  addressLine1: editData?.address1 || '',

  addressLine2: editData?.address2 || '',
  addressLine3: editData?.address3 || '',
  pinCode: editData?.pincode || '',
  inquiryPreference: editData?.inquiryPreferenceId || null,
  apparId: editData?.apparId || '',
  panNo: editData?.panNo || '',
  lastClassPassed: editData?.lastClassPassed || '',
});
export const documentFieldsInitialValues = () => ({
  documents: [],
});

export const familyFieldsInitialValues = (editData?: IFamilyInformationResponse | null) => ({
  fatherName: editData?.fatherDetails?.fullName || '',
  fatherDob: editData?.fatherDetails?.dateOfBirth
    ? dayjs(editData?.fatherDetails.dateOfBirth)
    : null,
  fatherOccupation: editData?.fatherDetails?.occupation || '',
  fatherQualification: editData?.fatherDetails?.qualification || '',
  fatherContactNo: editData?.fatherDetails?.contactNo
    ? validatePhoneNumber(editData?.fatherDetails?.contactNo)
    : '',
  fatherEmail: editData?.fatherDetails?.email || '',
  fatherPassOutYear: editData?.fatherDetails?.yearOfPassing || '',
  fatherOfficeNo: editData?.fatherDetails?.officeNo || '',
  fatherDesignation: editData?.fatherDetails?.designation || '',
  fatherOrganization: editData?.fatherDetails?.organization || '',
  fatherAadharNo: editData?.fatherDetails?.aadharNo || '',
  fatherRemarks: editData?.fatherDetails?.remarks || '',
  fatherAddress1: editData?.fatherDetails?.localAddress.address1 || '',
  fatherAddress2: editData?.fatherDetails?.localAddress.address2 || '',
  fatherAddress3: editData?.fatherDetails?.localAddress.address3 || '',
  fatherOfficeAddress1: editData?.fatherDetails?.officeAddress.address1 || '',
  fatherOfficeAddress2: editData?.fatherDetails?.officeAddress.address2 || '',
  fatherOfficeAddress3: editData?.fatherDetails?.officeAddress.address3 || '',
  fatherLocalCountry: editData?.fatherDetails?.localAddress.country?.name
    ? {
        name: editData?.fatherDetails?.localAddress.country?.name || '',
        isoCode: editData?.fatherDetails?.localAddress.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  fatherLocalState: editData?.fatherDetails?.localAddress.state?.name
    ? {
        name: editData?.fatherDetails?.localAddress.state?.name || '',
        isoCode: editData?.fatherDetails?.localAddress.state?.isoCode || '',
      }
    : { name: '', isoCode: '' },
  fatherLocalCity: {
    name: editData?.fatherDetails?.localAddress.city || '',
  },
  fatherLocalPincode: editData?.fatherDetails?.localAddress.pincode || '',
  fatherOfficeCountry: editData?.fatherDetails?.officeAddress.country?.name
    ? {
        name: editData?.fatherDetails?.officeAddress.country?.name || '',
        isoCode: editData?.fatherDetails?.officeAddress.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  fatherOfficeState: {
    name: editData?.fatherDetails?.officeAddress.state?.name || '',
    isoCode: editData?.fatherDetails?.officeAddress.state?.isoCode || '',
  },
  fatherOfficeCity: {
    name: editData?.fatherDetails?.officeAddress.city || '',
  },
  fatherOfficePincode: editData?.fatherDetails?.officeAddress.pincode || '',

  motherName: editData?.motherDetails?.fullName || '',
  motherDob: editData?.motherDetails?.dateOfBirth
    ? dayjs(editData?.motherDetails.dateOfBirth)
    : null,
  motherOccupation: editData?.motherDetails?.occupation || '',
  motherQualification: editData?.motherDetails?.qualification || '',
  motherContactNo: editData?.motherDetails?.contactNo
    ? validatePhoneNumber(editData?.motherDetails?.contactNo)
    : '',
  motherEmail: editData?.motherDetails?.email || '',
  motherPassOutYear: editData?.motherDetails?.yearOfPassing || '',
  motherOfficeNo: editData?.motherDetails?.officeNo || '',
  motherOfficeAddress1: editData?.motherDetails?.officeAddress.address1 || '',
  motherOfficeAddress2: editData?.motherDetails?.officeAddress.address2 || '',
  motherOfficeAddress3: editData?.motherDetails?.officeAddress.address3 || '',
  motherDesignation: editData?.motherDetails?.designation || '',
  motherOrganization: editData?.motherDetails?.organization || '',
  motherAadharNo: editData?.motherDetails?.aadharNo || '',
  motherRemarks: editData?.motherDetails?.remarks || '',
  motherAddress1: editData?.motherDetails?.localAddress.address1 || '',
  motherAddress2: editData?.motherDetails?.localAddress.address2 || '',
  motherAddress3: editData?.motherDetails?.localAddress.address3 || '',
  motherLocalCountry: editData?.motherDetails?.localAddress.country?.name
    ? {
        name: editData?.motherDetails?.localAddress.country?.name || '',
        isoCode: editData?.motherDetails?.localAddress.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  motherLocalState: editData?.motherDetails?.localAddress.state?.name
    ? {
        name: editData?.motherDetails?.localAddress.state?.name || '',
        isoCode: editData?.motherDetails?.localAddress.state?.isoCode || '',
      }
    : { name: '', isoCode: '' },
  motherLocalCity: {
    name: editData?.motherDetails?.localAddress.city || '',
  },
  motherLocalPincode: editData?.motherDetails?.localAddress.pincode || '',
  motherOfficeCountry: editData?.motherDetails?.officeAddress.country?.name
    ? {
        name: editData?.motherDetails?.officeAddress.country?.name || '',
        isoCode: editData?.motherDetails?.officeAddress.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  motherOfficeState: {
    name: editData?.motherDetails?.officeAddress.state?.name || '',
    isoCode: editData?.motherDetails?.officeAddress.state?.isoCode || '',
  },
  motherOfficeCity: {
    name: editData?.motherDetails?.officeAddress.city || '',
  },
  motherOfficePincode: editData?.motherDetails?.officeAddress.pincode || '',
  guardianName: editData?.guardianDetails?.fullName || '',
  guardianDob: editData?.guardianDetails?.dateOfBirth
    ? dayjs(editData?.guardianDetails.dateOfBirth)
    : null,
  guardianOccupation: editData?.guardianDetails?.occupation || '',
  guardianQualification: editData?.guardianDetails?.qualification || '',
  guardianContactNo: editData?.guardianDetails?.contactNo
    ? validatePhoneNumber(editData?.guardianDetails?.contactNo)
    : '',
  guardianEmail: editData?.guardianDetails?.email || '',
  guardianPassOutYear: editData?.guardianDetails?.yearOfPassing || '',
  guardianOfficeNo: editData?.guardianDetails?.officeNo || '',
  guardianOfficeAddress1: editData?.guardianDetails?.officeAddress.address1 || '',
  guardianOfficeAddress2: editData?.guardianDetails?.officeAddress.address2 || '',
  guardianOfficeAddress3: editData?.guardianDetails?.officeAddress.address3 || '',
  guardianDesignation: editData?.guardianDetails?.designation || '',
  guardianOrganization: editData?.guardianDetails?.organization || '',
  guardianAadharNo: editData?.guardianDetails?.aadharNo || '',
  guardianRemarks: editData?.guardianDetails?.remarks || '',
  guardianAddress1: editData?.guardianDetails?.localAddress.address1 || '',
  guardianAddress2: editData?.guardianDetails?.localAddress.address2 || '',
  guardianAddress3: editData?.guardianDetails?.localAddress.address3 || '',
  guardianLocalCountry: editData?.guardianDetails?.localAddress.country?.name
    ? {
        name: editData?.guardianDetails?.localAddress.country?.name || '',
        isoCode: editData?.guardianDetails?.localAddress.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  guardianLocalState: {
    name: editData?.guardianDetails?.localAddress.state?.name || '',
    isoCode: editData?.guardianDetails?.localAddress.state?.isoCode || '',
  },
  guardianLocalCity: {
    name: editData?.guardianDetails?.localAddress.city || '',
  },
  guardianLocalPincode: editData?.guardianDetails?.localAddress.pincode || '',

  guardianOfficeCountry: editData?.guardianDetails?.officeAddress.country?.name
    ? {
        name: editData?.guardianDetails?.officeAddress.country?.name || '',
        isoCode: editData?.guardianDetails?.officeAddress.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  guardianOfficeState: {
    name: editData?.guardianDetails?.officeAddress.state?.name || '',
    isoCode: editData?.guardianDetails?.officeAddress.state?.isoCode || '',
  },
  guardianOfficeCity: {
    name: editData?.guardianDetails?.officeAddress.city || '',
  },
  guardianOfficePincode: editData?.guardianDetails?.officeAddress.pincode || '',
});

export const CommunicationFieldsInitialValues = (
  editData?: ICommunicationInformationResponse | null
) => ({
  // commPrimaryContactNumber: editData?.primaryContactNo || '',
  // parentContactNumber: editData?.parentContactNo
  //   ? validatePhoneNumber(editData?.parentContactNo)
  //   : '',
  // parentEmail: editData?.parentEmail || '',
  // whatsAppContactNo: editData?.whatsappNo ? validatePhoneNumber(editData?.whatsappNo) : '',

  localCountry: editData?.localAddress?.country?.name
    ? {
        name: editData?.localAddress?.country?.name || '',
        isoCode: editData?.localAddress?.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  localState: {
    name: editData?.localAddress?.state?.name || '',
    isoCode: editData?.localAddress?.state?.isoCode || '',
  },
  localCity: {
    name: editData?.localAddress?.city || '',
  },
  localPincode: editData?.localAddress?.pincode || '',
  localAddressLine1: editData?.localAddress?.address1 || '',
  localAddressLine2: editData?.localAddress?.address2 || '',
  localAddressLine3: editData?.localAddress?.address3 || '',
  isOpenLocalAddress: true,
  sameAsStudentForLocal: false,
  emergencyCountry: editData?.emergencyAddress?.country?.name
    ? {
        name: editData?.emergencyAddress?.country?.name || '',
        isoCode: editData?.emergencyAddress?.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  emergencyState: {
    name: editData?.emergencyAddress?.state?.name || '',
    isoCode: editData?.emergencyAddress?.state?.isoCode || '',
  },
  emergencyCity: { name: editData?.emergencyAddress?.city || '' },
  emergencyPincode: editData?.emergencyAddress?.pincode || '',
  emergencyAddressLine1: editData?.emergencyAddress?.address1 || '',
  emergencyAddressLine2: editData?.emergencyAddress?.address2 || '',
  emergencyAddressLine3: editData?.emergencyAddress?.address3 || '',
  emergencySameAsLocal: false,
  isOpenEmergencyAddress: true,

  permanentAddress: editData?.permanentAddress?.address1 || '',
  permanentAddressLine2: editData?.permanentAddress?.address2 || '',
  permanentAddressLine3: editData?.permanentAddress?.address3 || '',
  permanentCountry: editData?.permanentAddress?.country?.name
    ? {
        name: editData?.permanentAddress?.country?.name || '',
        isoCode: editData?.permanentAddress?.country?.isoCode || '',
      }
    : { name: 'India', isoCode: 'IN' },
  permanentState: {
    name: editData?.permanentAddress?.state?.name || '',
    isoCode: editData?.permanentAddress?.state?.isoCode || '',
  },
  permanentCity: { name: editData?.permanentAddress?.city || '' },
  permanentPincode: editData?.permanentAddress?.pincode || '',
  sameAsLocalForPermanent: false,
  isOpenPermanentAddress: true,
});

export const additionalDetailsInitialValues = (
  editData?: IAdditionalInformationResponse | null
) => ({
  category: editData?.category || Category.General,
  RTE: editData?.category !== Category.General,
  bplStudent: editData?.isBPLStudent || false,
  bplCardNo: editData?.bplCardNo || '',
  personWithDisability: editData?.haveDisability || false,
  secondLanguage: editData?.secondLanguage || '',
  emergencyContactNo: editData?.emergencyContactNo
    ? validatePhoneNumber(editData?.emergencyContactNo)
    : '',
  relationName: editData?.emergencyRelativeName || '',
  relation: editData?.emergencyRelation || '',
  singleParentChild: editData?.isSingleParentChild || false,
  singleChild: editData?.isSingleChild || false,
  libraryMember: editData?.isLibraryMember || false,
  transportMember: editData?.isTransportMember || false,
});

export const medicalFieldsInitialValues = (editData?: IMedicalInformationResponse | null) => ({
  weight: editData?.weightKg || '',
  height: editData?.heightCm || '',
  bmi: editData?.bodyMassIndex || '',
  pulseRate: editData?.pulseRate || '',
  haemoglobin: editData?.hemoglobin || '',
  allergies: editData?.allergies || '',
  covidVaccination: editData?.covidVaccinationDoses || '',
  childImmunisation: editData?.childImmunization || '',
  immunisationRemarks: editData?.immunizationRemarks || '',
});

export const previousSchoolFieldsInitialValues = (editData?: IPreviousSchoolResponse | null) => ({
  schoolName: editData?.schoolName || '',
  schoolAddress: editData?.schoolAddress || '',
  schoolBoard: editData?.board || '',
  schoolMedium: editData?.medium || '',
  tcNumber: editData?.tcNumber || '',
  previousClass: editData?.lastClassAttended || '',
  percentage: editData?.percentageObtained || '',
});

export const bankDetailsInitialValues = (editData?: IBankDetailsResponse | null) => ({
  bankName: editData?.bankName || '',
  accountNo: editData?.accountNo || '',
  ifscCode: editData?.ifscCode || '',
  branchName: editData?.branchName || '',
  accountHolderName: editData?.accountHolderName || '',
});
