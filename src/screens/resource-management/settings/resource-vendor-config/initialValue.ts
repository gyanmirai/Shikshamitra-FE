import type { IResourceVendorFormValues } from './resource-vendor-config-interface';

export function getResourceVendorInitialValues(
  data: Partial<IResourceVendorFormValues> | null = null
): IResourceVendorFormValues {
  return {
    vendorName: data?.vendorName || '',
    vendorContactNumber: data?.vendorContactNumber || '',
    vendorSecondaryContactNumber: data?.vendorSecondaryContactNumber || '',
    vendorComponyName: data?.vendorComponyName || '',
    vendorComponyEmail: data?.vendorComponyEmail || '',
    vendorComponyCity: data?.vendorComponyCity || { name: '' },
    vendorComponyCountry: data?.vendorComponyCountry || { name: '' },
    vendorComponyState: data?.vendorComponyState || { name: '' },
    vendorComponyZipCode: data?.vendorComponyZipCode || '',
    vendorComponyAddress: data?.vendorComponyAddress || '',
    vendorGstNumber: data?.vendorGstNumber || '',
    vendorPanNumber: data?.vendorPanNumber || '',
    vendorBankName: data?.vendorBankName || '',
    vendorBankAccountNumber: data?.vendorBankAccountNumber || '',
    vendorBankIfscCode: data?.vendorBankIfscCode || '',
    vendorBankBranchName: data?.vendorBankBranchName || '',
    vendorBankAccountType: data?.vendorBankAccountType || '',
    vendorUpiId: data?.vendorUpiId || '',
    vendorComponyDescription: data?.vendorComponyDescription || '',
    vendorTagForQuickSearch: data?.vendorTagForQuickSearch || '',
  };
}
