import type { ICity, IState, ICountry } from 'country-state-city';

export interface IFormValues {
  instituteName: string;
  instituteLogo: string[];
  instituteBanner: string[];
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city?: Partial<ICity>;
  stateProvince?: Partial<IState>;
  zipPostalCode: string;
  country?: Partial<ICountry>;
  contactNumber: string;
  emailAddress: string;
  password: string;
  principleSign: string[];
}

export interface IImageSliderProps {
  images: string[];
  open: boolean;
  onClose: () => void;
}
