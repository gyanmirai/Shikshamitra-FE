import type { Dayjs } from 'dayjs';
import type { GenderType } from 'src/enums/gender';
import type { ICity, IState, ICountry } from 'country-state-city';

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
