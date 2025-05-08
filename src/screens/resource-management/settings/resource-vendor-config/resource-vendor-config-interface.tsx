import type { ICity, IState, ICountry } from 'country-state-city';

export interface IResourceVendorFormValues {
  vendorName: string;
  vendorContactNumber: string;
  vendorSecondaryContactNumber: string;
  vendorComponyName: string;
  vendorComponyEmail: string;
  vendorComponyCity: Partial<ICity>;
  vendorComponyCountry: Partial<ICountry>;
  vendorComponyState: Partial<IState>;
  vendorComponyZipCode: string;
  vendorComponyAddress: string;
  vendorGstNumber: string;
  vendorPanNumber: string;
  vendorBankName: string;
  vendorBankAccountNumber: string;
  vendorBankIfscCode: string;
  vendorBankBranchName: string;
  vendorBankAccountType: string;
  vendorUpiId: string;
  vendorComponyDescription: string;
  vendorTagForQuickSearch: string;
}

export interface IAddReportLossDialogProps {
  isEdit: boolean;
  data: IResourceVendorFormValues;
  onClose: () => void;
}

export interface IReportVendorTableProps {
  onClick: (data: IResourceVendorFormValues, eventName: string) => void;
}

export interface IResourceVendorFormProps {
  isEdit: boolean;
  data: IResourceVendorFormValues | null;
  onClose: () => void;
}
