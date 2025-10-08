import dayjs from 'dayjs';

import type { IVehiclePayload } from '../Components/type';

export const getInitialVehicleData = (editData?: IVehiclePayload): IVehiclePayload => ({
  registrationNo: editData?.registrationNo || '',
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
  isAC: editData?.isAC || false,
  isNonAC: editData?.isNonAC || false,
  description: editData?.description || '',

  documents: {
    registrationCertificate: editData?.documents?.registrationCertificate || null,
    insuranceCertificate: editData?.documents?.insuranceCertificate || null,
    fitnessCertificate: editData?.documents?.fitnessCertificate || null,
    vehiclePhotos: editData?.documents?.vehiclePhotos || null,
  },

  insuranceCompany: editData?.insuranceCompany || '',
  policyNo: editData?.policyNo || '',
  insuranceIssueDate: editData?.insuranceIssueDate ? dayjs(editData?.insuranceIssueDate) : null,
  insuranceExpiryDate: editData?.insuranceExpiryDate ? dayjs(editData?.insuranceExpiryDate) : null,
  coverageAmount: editData?.coverageAmount || null,

  pucCertificateNo: editData?.pucCertificateNo || '',
  pucIssueDate: editData?.pucIssueDate ? dayjs(editData?.pucIssueDate) : null,
  pucExpiryDate: editData?.pucExpiryDate ? dayjs(editData?.pucExpiryDate) : null,

  fitnessCertificateNo: editData?.fitnessCertificateNo || '',
  fitnessIssueDate: editData?.fitnessIssueDate ? dayjs(editData.fitnessIssueDate) : null,
  fitnessExpiryDate: editData?.fitnessExpiryDate ? dayjs(editData.fitnessExpiryDate) : null,

  roadTaxReceiptNo: editData?.roadTaxReceiptNo || '',
  roadTaxIssueDate: editData?.roadTaxIssueDate ? dayjs(editData.roadTaxIssueDate) : null,

  maintenance: {
    serviceDate: editData?.maintenance?.serviceDate
      ? dayjs(editData.maintenance.serviceDate)
      : null,
    serviceNotes: editData?.maintenance?.serviceNotes || '',
    serviceCost: editData?.maintenance?.serviceCost || '',
    serviceProvider: editData?.maintenance?.serviceProvider || '',
    nextServiceDate: editData?.maintenance?.nextServiceDate
      ? dayjs(editData.maintenance.nextServiceDate)
      : null,
    documents: editData?.maintenance?.documents || [],
  },
});
