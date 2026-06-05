import type { Dayjs } from 'dayjs';

export interface IPersonalInformationResponse {
  id: string;
  userId?: string | null;
  firstName: string;
  middleName: string;
  lastName: string;
  shortName: string;
  dob: string;
  gender: number;
  religion: string;
  casteType: number;
  familyCaste: string;
  maritalStatus: number;
  bloodGroup: number;
  email: string;
  mobileNo: string;
  secondaryMobileNo: string;
  dateOfJoining: string;
  doj: string;
  isTeaching: boolean;
  department: string;
  roleId: string;
  shiftId: string;
  organizationIds: string[];
  organizations?: { id: string; name: string }[];
  organizationNames?: string[];
  address1: string;
  address2: string;
  address3: string;
  country: {
    name: string;
    isoCode: string;
  };
  state: {
    name: string;
    isoCode: string;
  };
  city: string;
  pinCode: string;
  profilePicture?: string | null;
  thumbnailPicture?: string | null;
  adharNo?: string | null;
  panNo?: string | null;
}

export interface IFamilyMemberDetails {
  name: string;
  occupation: string;
  mobileNo: string;
  address1: string;
  address2: string;
  address3: string;
  country: {
    name: string;
    isoCode: string;
  };
  state: {
    name: string;
    isoCode: string;
  };
  city: string;
  pincode: string;
}

export interface IFamilyInformationResponse {
  id: string;
  fatherDetails: IFamilyMemberDetails;
  motherDetails: IFamilyMemberDetails;
  spouseDetails: IFamilyMemberDetails;
}

export interface IAdditionalInformationResponse {
  bplCardNo: string;
  personWithDisability: boolean;
  secondLanguage: string;
  isLibraryMember: boolean;
  isTransportMember: boolean;
}

export interface IWorkExperienceResponse {
  id: string;
  mediumStageName: string;
  designation: string;
  department: string;
  country: {
    name: string;
    isoCode: string;
  };
  state: {
    name: string;
    isoCode: string;
  };
  city: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
}

export interface IBankDetails {
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface ISalaryDetails {
  pfRuleId: string;
  epfNumber: string;
  uanNumber: string;
  basicSalary?: number;
  punchId: string;
  totalWorkingHourPerMonth: number;
}

export interface ISalaryComponent {
  name: string;
  description: string;
  amount: number;
  isFixed: boolean;
  isTemp: boolean;
  componentType: string;
  dependOn: string;
}

export interface IPayrollInformation {
  bankDetails: IBankDetails;
  salaryDetails: ISalaryDetails;
  earningComponents: ISalaryComponent[];
  deductionComponents: ISalaryComponent[];
  policyOverrideEnabled?: boolean;
  policyOverrideWasEnabled?: boolean;
  policyOverridePayrollPolicyId?: string;
  policyOverrideAttendancePolicyId?: string;
  policyOverrideEffectiveFrom?: string;
  policyOverrideAssignmentReason?: string;
}

export interface IReportingManager {
  id: string;
  employeeIdentifier: string;
  fullName: string;
  designation: string;
}

export interface IReportingInformationResponse {
  employeeId: string;
  reportingManager: IReportingManager;
}
