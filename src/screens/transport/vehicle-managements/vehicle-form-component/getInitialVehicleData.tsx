import dayjs from 'dayjs';

import type { IVehiclePayload } from '../components/type';

export const getInitialVehicleData = (editData?: IVehiclePayload): IVehiclePayload => ({
  id: editData?.id,
  registrationNo: editData?.registrationNo || '',
  vehicleName: editData?.vehicleName || '',
  vehicleNo: editData?.vehicleNo || '',
  vehicleType: editData?.vehicleType || '',
  vehicleCompany: editData?.vehicleCompany || '',
  model: editData?.model || '',
  yearOfManufacture: editData?.yearOfManufacture || '',
  seatingCapacity: editData?.seatingCapacity || 0,
  vehicleColor: editData?.vehicleColor || '',
  schoolAssignedNo: editData?.schoolAssignedNo || '',
  owner: editData?.owner || '',
  fuelType: editData?.fuelType || '',
  isAc: editData?.isAc || false,
  description: editData?.description || '',

  // Documents as array
  documents: editData?.documents || [],

  // Insurance object
  insurance: editData?.insurance || {
    insuranceCompany: '',
    policyNo: '',
    issueDate: null,
    expiryDate: null,
    coverageAmount: null,
  },

  // PUC object
  puc: editData?.puc || {
    certificateNo: '',
    issueDate: null,
    expiryDate: null,
  },

  // Road Tax object
  roadTax: editData?.roadTax || {
    receiptNo: '',
    issueDate: null,
  },

  // Legacy fields for backward compatibility (optional)
  insuranceCompany: editData?.insuranceCompany || editData?.insurance?.insuranceCompany || '',
  policyNo: editData?.policyNo || editData?.insurance?.policyNo || '',
  insuranceIssueDate: editData?.insuranceIssueDate
    ? dayjs(editData.insuranceIssueDate)
    : editData?.insurance?.issueDate
      ? dayjs(editData.insurance.issueDate)
      : null,
  insuranceExpiryDate: editData?.insuranceExpiryDate
    ? dayjs(editData.insuranceExpiryDate)
    : editData?.insurance?.expiryDate
      ? dayjs(editData.insurance.expiryDate)
      : null,
  coverageAmount: editData?.coverageAmount || editData?.insurance?.coverageAmount || null,
  pucCertificateNo: editData?.pucCertificateNo || editData?.puc?.certificateNo || '',
  pucIssueDate: editData?.pucIssueDate
    ? dayjs(editData.pucIssueDate)
    : editData?.puc?.issueDate
      ? dayjs(editData.puc.issueDate)
      : null,
  pucExpiryDate: editData?.pucExpiryDate
    ? dayjs(editData.pucExpiryDate)
    : editData?.puc?.expiryDate
      ? dayjs(editData.puc.expiryDate)
      : null,
  fitnessCertificateNo: editData?.fitnessCertificateNo || '',
  fitnessIssueDate: editData?.fitnessIssueDate ? dayjs(editData.fitnessIssueDate) : null,
  fitnessExpiryDate: editData?.fitnessExpiryDate ? dayjs(editData.fitnessExpiryDate) : null,
  roadTaxReceiptNo: editData?.roadTaxReceiptNo || editData?.roadTax?.receiptNo || '',
  roadTaxIssueDate: editData?.roadTaxIssueDate
    ? dayjs(editData.roadTaxIssueDate)
    : editData?.roadTax?.issueDate
      ? dayjs(editData.roadTax.issueDate)
      : null,
  isNonAc: false,
});
