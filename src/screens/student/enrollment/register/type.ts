import type { GenderType } from 'src/enums/gender';
import type { SxProps, GridProps } from '@mui/material';
import type { Category } from 'src/enums/studnet-category';

export interface FieldsType {
  type: string;
  label: string;
  name: string;
  placeholder?: string;
  sx?: SxProps;
  otherProps?: Record<string, any> | ((props: any) => Record<string, any>);
  renderComp?: (props: any) => React.ReactNode;
  gridProps?: GridProps;
}

export interface IGeneralInformationResponse {
  studentId: string;
  inquiryNo: string;
  formNo: string;
  standard: string;
  standardId: string;
  academicMediumId: string;
  academicMediumName: string;
  academicBoardId: string;
  academicBoardName: string;
  academicYearId: string;
  academicYearName: string;
  profilePicture: string;

  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: GenderType;

  primaryContactNo: string;
  secondaryContactNo: string;
  email: string;

  adharNo: string;
  apparId: 'string';
  panNo: 'string';
  religion: 0;
  familyCast: 'string';
  castCategory: 0;
  nationality: 'string';
  birthPlace: 'string';
  motherTongue: 0;
  address1: 'string';
  address2: 'string';
  address3: 'string';

  country: {
    name: string;
    isoCode: string;
  };
  city: string;
  state: {
    name: string;
    isoCode: string;
  };
  pincode: string;

  previousSchool: 'string';
  lastClassPassed: 'string';

  inquiryPreference: string;
  inquiryPreferenceId: string;
}

export interface IFamilyInformationResponse {
  studentId: string;
  fatherDetails: {
    name: string;
    dateOfBirth: string;
    occupation: string;
    qualification: string;
    contactNo: string;
    email: string;
    passOutYear: string;
    officeNo: string;
    designation: string;
    organisation: string;
    aadhaarNo: string;
    remarks: string;

    localAddress: {
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
    };

    officeAddress: {
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
    };
  };
  motherDetails: {
    name: string;
    dateOfBirth: string;
    occupation: string;
    qualification: string;
    contactNo: string;
    email: string;
    passOutYear: string;
    officeNo: string;
    designation: string;
    organisation: string;
    aadhaarNo: string;
    remarks: string;

    localAddress: {
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
    };
    officeAddress: {
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
    };
  };
  guardianDetails: {
    name: string;
    dateOfBirth: string;
    occupation: string;
    qualification: string;
    contactNo: string;
    email: string;
    passOutYear: string;
    officeNo: string;
    designation: string;
    organisation: string;
    aadhaarNo: string;
    remarks: string;

    localAddress: {
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
    };
    officeAddress: {
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
    };
  };
  siblingStudents: {
    studentId: string;
    fullName: string;
    standardName: string;
    divisionName: string;
    grNo: number;
  }[];
}

export interface ICommunicationInformationResponse {
  studentId: string;
  localAddress: {
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
  };
  emergencyAddress: {
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
  };
  permanentAddress: {
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
  };
  isPermanentSameAsLocal: boolean;
  isEmergencySameAsLocal: boolean;
}

export interface IAdditionalInformationResponse {
  studentId: string;
  status: number;
  category: Category;
  isBPLStudent: boolean;
  bplCardNo: string;
  secondLanguage: string;
  haveDisability: boolean;
  emergencyRelativeName: string;
  emergencyRelation: string;
  emergencyContactNo: string;
  isSingleChild: boolean;
  isSingleParentChild: boolean;
}

export interface IMedicalInformationResponse {
  studentId: string;
  status: number;
  weightKg: number;
  heightCm: number;
  bodyMassIndex: number;
  pulseRate: number;
  hemoglobin: number;
  allergies: string;
  childImmunization: string;
  covidVaccinationDoses: number;
  immunizationRemarks: string;
  bloodGroup: string;
  chronicConditions: string;
  currentMedications: string;
}

export interface IPreviousSchoolResponse {
  studentId: string;
  status: number;
  schoolName: string;
  schoolAddress: string;
  board: string;
  medium: string;
  lastClassAttended: string;
  tcNumber: string;
  dateOfLeaving: string;
  percentageObtained: number;
  academicYear: string;
  reasonForLeaving: string;
  remarks: string;
}

export interface IBankDetailsResponse {
  studentId: string;
  status: number;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string;
  accountHolderName: string;
  accountType: string;
  bankAddress: string;
  micrCode: string;
  swiftCode: string;
}
