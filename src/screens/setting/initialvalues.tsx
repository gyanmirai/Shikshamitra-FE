export const basicInformationInitialValues = (editData: any) => ({
  instituteName: editData?.name || '',
  instituteLogo: editData?.extraProperties?.Logo || [],
  instituteBanner: editData?.extraProperties?.Banner || [],
  addressLine1: editData?.extraProperties?.Address1 || '',
  addressLine2: editData?.extraProperties?.Address2 || '',
  addressLine3: editData?.extraProperties?.Address3 || '',
  city: editData?.extraProperties?.City ? { name: editData?.extraProperties?.City } : undefined,
  stateProvince: editData?.extraProperties?.State
    ? {
        name: editData?.extraProperties?.State?.name,
        isoCode: editData?.extraProperties?.State?.isoCode,
      }
    : undefined,
  zipPostalCode: editData?.extraProperties?.PostalCode || '',
  country: editData?.extraProperties?.Country
    ? {
        name: editData?.extraProperties?.Country?.name,
        isoCode: editData?.extraProperties?.Country?.isoCode,
      }
    : undefined,
  contactNumber: editData?.extraProperties?.ContactNumber || '',
  emailAddress: editData?.adminEmailAddress || '',
  password: '',
  principleSign: editData?.extraProperties?.PrincipleSign || [],
});
