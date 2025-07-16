export interface IFormValues {
  instituteName: string;
  instituteLogo: string[];
  instituteBanner: string[];
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city?: { name: string };
  stateProvince?: { name: string; isoCode?: string };
  zipPostalCode: string;
  country?: { name: string; isoCode?: string };
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
