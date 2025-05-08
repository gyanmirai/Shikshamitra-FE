import * as Yup from 'yup';

export const resourceVendorValidationSchema = Yup.object().shape({
  vendorName: Yup.string().required('Vendor name is required'),
  vendorContactNumber: Yup.string().required('Contact number is required'),
  vendorSecondaryContactNumber: Yup.string().optional(),
  vendorComponyName: Yup.string().required('Company name is required'),
  vendorComponyEmail: Yup.string().email('Invalid email').required('Email is required'),
  vendorComponyCountry: Yup.object({
    name: Yup.string().required('Country is required'),
  }).required('Country is required'),

  vendorComponyState: Yup.object({
    name: Yup.string().required('State is required'),
  }).required('State is required'),

  vendorComponyCity: Yup.object({
    name: Yup.string().required('City is required'),
  }).required('City is required'),
  vendorComponyZipCode: Yup.string().required('Zip code is required'),
  vendorComponyAddress: Yup.string().required('Address is required'),
  vendorGstNumber: Yup.string().required('GST number is required'),
  vendorPanNumber: Yup.string().required('PAN number is required'),
  vendorBankName: Yup.string().required('Bank name is required'),
  vendorBankAccountNumber: Yup.string().required('Bank account number is required'),
  vendorBankIfscCode: Yup.string().required('IFSC code is required'),
  vendorBankBranchName: Yup.string().required('Branch name is required'),
  vendorBankAccountType: Yup.string().required('Account type is required'),
  vendorUpiId: Yup.string().required('UPI ID is required'),
  vendorComponyDescription: Yup.string().required('Description is required'),
  vendorTagForQuickSearch: Yup.string().required('Tag is required'),
});
