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
  gender: GenderType;
  address: string;
  parentsContactNo: string;
  alternateContactDetails: string;
  previousSchool: string;
  inquiryPreferences: string;
  country: { name: ICountry['name']; isoCode: ICountry['isoCode'] };
  city: { name: ICity['name'] };
  state: { name: IState['name']; isoCode: IState['isoCode'] };
  pinCode: number;
  medium: string;
  formNo: string | undefined;
  board: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  email: string;
  village: string;
}
