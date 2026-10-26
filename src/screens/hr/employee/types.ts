import type { Dayjs } from 'dayjs';
import type { SalaryBasis } from 'src/redux/hr/salary-template-api';

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
  quotedSalaryBasis?: SalaryBasis | null;
  quotedMonthlyAmount?: number | null;
  sourceSalaryTemplateId?: string | null;
  sourceSalaryTemplateVersionId?: string | null;
  sourceSalaryTemplateVersion?: number | null;
  salaryGeneratedAt?: string | null;
  wasModifiedAfterGeneration?: boolean;
}

export interface ISalaryComponent {
  name: string;
  description: string;
  amount: number;
  isFixed: boolean;
  isTemp: boolean;
  componentType: string;
  dependOn: string;
  semanticType?: string;
  statutoryRuleId?: string | null;
}

export interface IPayrollInformation {
  bankDetails: IBankDetails;
  salaryDetails: ISalaryDetails;
  earningComponents: ISalaryComponent[];
  deductionComponents: ISalaryComponent[];
  policyOverrideEnabled?: boolean;
  policyOverrideWasEnabled?: boolean;
  policyOverrideAssignmentId?: string;
  policyOverridePayrollPolicyId?: string;
  policyOverrideAttendancePolicyId?: string;
  policyOverrideLeavePolicyId?: string;
  policyOverrideEffectiveFrom?: string;
  policyOverrideAssignmentReason?: string;
}

export interface IReportingManager {
  kind?: 'Employee' | 'TenantAdministrator';
  id: string;
  employeeIdentifier: string;
  fullName: string;
  designation: string;
  status?: number;
  email?: string;
}

export interface IReportingInformationResponse {
  employeeId: string;
  reportingManager: IReportingManager;
}
