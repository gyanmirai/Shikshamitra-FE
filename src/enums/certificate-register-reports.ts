export enum CertificateRegisterReportTitle {
  FeeCertificateBasedOnReceipt,
  FeeCertificateBasedOnReceiptWithDetail,
  FeeCertificateBasedOnStudentFee,
  FeeCertificateBasedOnTotalFee,
  FeeCertificateWithAllFeeDetails,
  FeeRegisterAllStudent,
}

export const CertificateRegisterReportTitleOptions = [
  {
    name: CertificateRegisterReportTitle.FeeCertificateBasedOnReceipt,
    label: 'Fee Certificate Based On Receipt',
  },
  {
    name: CertificateRegisterReportTitle.FeeCertificateBasedOnReceiptWithDetail,
    label: 'Fee Certificate Based On Receipt With Detail',
  },
  {
    name: CertificateRegisterReportTitle.FeeCertificateBasedOnStudentFee,
    label: 'Fee Certificate Based On Student Fee',
  },
  {
    name: CertificateRegisterReportTitle.FeeCertificateBasedOnTotalFee,
    label: 'Fee Certificate Based On Total Fee',
  },
  {
    name: CertificateRegisterReportTitle.FeeCertificateWithAllFeeDetails,
    label: 'Fee Certificate With All Fee Details',
  },
  {
    name: CertificateRegisterReportTitle.FeeRegisterAllStudent,
    label: 'Fee Register All Student',
  },
];
