export enum MiscAdminReportsTitle {
  AllBatchFeeStatus = 'AllBatchFeeStatus',
  FRCStatement = 'FRCStatement',
  PendingFeeAllBatch = 'PendingFeeAllBatch',
  PendingFeeWithFeeName = 'PendingFeeWithFeeName',
  CrossOrganizationAdminQueries = 'CrossOrganizationAdminQueries',
}

export const MiscAdminReportsTitleOptions = [
  { label: 'All Batch Fee Status', name: MiscAdminReportsTitle.AllBatchFeeStatus },
  { label: 'FRC Statement', name: MiscAdminReportsTitle.FRCStatement },
  { label: 'Pending Fee All Batch', name: MiscAdminReportsTitle.PendingFeeAllBatch },
  { label: 'Pending Fee With Fee Name', name: MiscAdminReportsTitle.PendingFeeWithFeeName },
  {
    label: 'Cross-Organization Admin Queries',
    name: MiscAdminReportsTitle.CrossOrganizationAdminQueries,
  },
];
