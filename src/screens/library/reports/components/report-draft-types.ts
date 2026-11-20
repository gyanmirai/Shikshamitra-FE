import type { LibraryReportOptions } from 'src/redux/library/library-adapters';

export type LibraryReportIdentity = {
  id: string;
  name: string;
  description?: string;
  isComingSoon?: boolean;
};
export type ReportDraftValues = {
  format: string;
  search: string;
  fromDate: string;
  toDate: string;
  asOfDate: string;
  copyStatus: string;
  issueStatus: string;
  chargeStatus: string;
  top: string;
};
export type ReportFilterProps = {
  report: LibraryReportIdentity;
  options?: LibraryReportOptions;
  values: ReportDraftValues;
  disabled: boolean;
  onChange: (field: keyof ReportDraftValues, value: string) => void;
};
export const supportsReportAsOf = (id: string) =>
  ['Issue Return Report', 'Overdue Books Report', 'Library Member List'].includes(id);
export const supportsReportRange = (id: string) =>
  [
    'Issue Return Report',
    'Overdue Books Report',
    'Fine Collection Report',
    'Book Reservation Report',
  ].includes(id);
