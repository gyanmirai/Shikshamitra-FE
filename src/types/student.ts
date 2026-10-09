import type { Dayjs } from 'dayjs';
import type { YesNo } from 'src/enums/yes-no';
import type { GenderType } from 'src/enums/gender';
import type { Category } from 'src/enums/studnet-category';
import type { EmployeeCastType } from 'src/enums/employee-cast';
import type { ICity, IState, ICountry } from 'country-state-city';
import type { Board, Medium, Division, Standards, AcademicYear } from 'src/types/school';

export interface IInquiryFormValues {
  // inquiryNumber: string;
  // organization: string;
  academicYear: string;
  class: string;
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: Dayjs | null;
  age: string | number;
  dateOfInquiry: Dayjs | null;
  gender: GenderType | string;
  address: string;
  primaryContactNumber: string;
  secondaryContactNumber: string;
  previousSchool: string;
  inquiryPreferences: string;
  country: { name: ICountry['name']; isoCode: ICountry['isoCode'] };
  city: { name: ICity['name'] };
  state: { name: IState['name']; isoCode: IState['isoCode'] };
  pinCode: string | null;
  medium: string;
  formNo: string | undefined;
  board: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  email: string;
  // village: string;
}

export interface IInquiryResponse {
  studentId: string;
  inquiryNo: string;
  studentName: string;
  standard: string;
  standardId: string;
  academicMediumId: string;
  academicMediumName: string;
  academicBoardId: string;
  academicBoardName: string;
  academicYearId: string;
  academicYearName: string;
  dateOfBirth: string;
  age: string;
  dateOfInquiry: string;
  gender: GenderType;
  address: string;
  primaryContactNo: string;
  secondaryContactNo: string;
  previousSchool: string;
  inquiryPreference: string;
  inquiryPreferenceId: string;
  nextReminderDate: string;

  formNo: string;

  firstName: string;
  middleName: string;
  lastName: string;

  country: {
    name: string;
    isoCode: string;
  };
  city: string;
  state: {
    name: string;
    isoCode: string;
  };
  pinCode: string;

  address1: string;
  address2: string;
  address3: string;

  email: string;
}

export interface ParentBankDetails {
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface PreviousSchoolDetails {
  previousSchoolName: string;
  previousSchoolAddress: string;
  previousSchoolBoard: string;
  previousSchoolMedium: string;
  tcNo: string;
  lastClassPassed: string;
  percentage: number;
}

export interface StudentMedicalRecords {
  weight: number;
  height: number;
  bodyMassIndex: number;
  haemoglobin: string;
  allergies: string;
  covidVaccination: string;
  childImmunisation: string;
  immunisationRemarks: string;
}

export interface InquiryPreference {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  preferenceName: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  deactivationReason?: string | null;
  assignedStudentsCount?: number;
  canDelete?: boolean;
}

export interface IGroupMembership {
  groupId: string;
  groupName: string;
  isDivisionLeader: boolean;
  isLeader: boolean;
}

export interface StudentBasicDetails {
  userId: string;
  profilePicture: string;
  aadhaarNo: string;
  religion: string;
  familyCast: string;
  castType: EmployeeCastType;
  motherTongue: string;
  nationality: string;
  birthPlace: string;
  temporaryGr: string;
  remarks: string;
}

export interface ParentDetails {
  name: string;
  dateOfBirth: string;
  occupation: string;
  qualification: string;
  contactNo: string;
  email: string;
  passOutYear: number;
  officeNo: string;
  designation: string;
  organisation: string;
  aadhaarNo: string;
  remarks: string;
  address1: string;
  address2: string;
  address3: string;
  officeAddress1: string;
  officeAddress2: string;
  officeAddress3: string;
  localCountry: ICountry;
  localState: IState;
  localCity: string;
  localPincode: number | null;
  officeCountry: ICountry;
  officeState: IState;
  officeCity: string;
  officePincode: number | null;
}

export interface StudentCommunicationDetails {
  primaryContactNo: string;
  parentContactNo: string;
  parentEmail: string;
  studentContactNo: string;
  studentEmail: string;
  whatsAppNo: string;

  localAddressLine1: string;
  localAddressLine2: string;
  localAddressLine3: string;
  localCountry: ICountry;
  localState: IState;
  localCity: ICity;
  localPinCode: string;

  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentAddressLine3: string;
  permanentCountry: ICountry;
  permanentState: IState;
  permanentCity: ICity;
  permanentPinCode: string;

  emergencyAddressLine1: string;
  emergencyAddressLine2: string;
  emergencyAddressLine3: string;
  emergencyCountry: ICountry;
  emergencyState: IState;
  emergencyCity: ICity;
  emergencyPinCode: string;
  remarks: string;
}

export interface StudentAdditionalDetails {
  category: Category;
  rightToEducation: YesNo;
  bplStudent: YesNo;
  bplCardNo: string;
  personWithDisability: YesNo;
  secondLanguage: string;
  emergencyContactNo: string;
  relationName: string;
  relation: string;
  singleParentChild: YesNo;
  singleChild: YesNo;
  sponsorName?: string;
}

export interface IInquiryData {
  studentName: string;
  id: string;
  userId: string;
  inquiryPreferencesId: string;
  studentEnrollmentState: number;
  inquiryNumber: string | undefined;
  formNumber: string;
  firstName: string;
  email: string;
  middleName: string;
  lastName: string;
  name: string;
  previousSchoolName: string;
  dateOfBirth: string;
  dateOfInquiry: string;
  gender: GenderType | string;
  primaryContactNumber: string;
  secondaryContactNumber: string;
  secondaryContactNo: string;
  dueDate?: string;
  country: ICountry;
  city: string;
  state: IState;
  // village: string;
  tempGrNo: number;
  grNo: number | null;
  grNumber?: string | null;
  rollNo: number | null;
  pinCode: number | null;
  address: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  fatherAddress1: string;
  fatherAddress2: string;
  fatherAddress3: string;
  fatherOfficeAddress1: string;
  fatherOfficeAddress2: string;
  fatherOfficeAddress3: string;
  fatherLocalCountry: ICountry;
  fatherLocalState: IState;
  fatherLocalCity: string;
  fatherLocalPincode: number | null;
  inquiryStatusType: number;
  educationMediumId: string;
  educationMedium: Medium;
  educationBoardId: string;
  educationBoard: Board;
  academicYearId: string;
  academicYear: AcademicYear;
  standardId: string;
  standard: Standards;
  division: Division;
  divisionId: string;
  inquiryPreferenceId: string;
  inquiryPreference: InquiryPreference;
  studentBasicDetails: StudentBasicDetails;
  fatherDetails: ParentDetails;
  motherDetails: ParentDetails;
  guardianDetails: ParentDetails;
  studentCommunicationDetails: StudentCommunicationDetails;
  studentAdditionalDetails: StudentAdditionalDetails;
  studentMedicalRecords: StudentMedicalRecords;
  previousSchoolDetails: PreviousSchoolDetails;
  parentBankDetails: ParentBankDetails;
  profilePicture?: string;
  aadhaarNo: string;
  religion: string;
  familyCast: string;
  castType: EmployeeCastType;
  motherTongue: string;
  nationality: string;
  birthPlace: string;
  temporaryGr: string;
  panNo: string;
  apparId: string;
  remarks: string;
  onboardingProgressState: number;
  groupMembership: IGroupMembership;
  formNo: string;
  lastClassPassed: string;
  studentId?: string;
  isFeeStructureAssigned?: boolean;
  status?: number | string;
  operationalStatus?: number | null;
  entranceExamStatus?: number | null;
  entranceExamStatusDisplay?: string | null;
}
