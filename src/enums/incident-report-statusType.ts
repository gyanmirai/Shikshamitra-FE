export enum IncidentReportStatusType {
  Resolved,
  New,
  UnderReview,
  Replaced,
}

export const IncidentReportStatusTypeOptions = [
  {
    label: 'Under Review',
    value: IncidentReportStatusType.UnderReview,
  },
  {
    label: 'Resolved',
    value: IncidentReportStatusType.Resolved,
  },
  {
    label: 'New',
    value: IncidentReportStatusType.New,
  },
  {
    label: 'Replaced',
    value: IncidentReportStatusType.Replaced,
  },
];

export const IncidentReportStatusTypeColor = {
  [IncidentReportStatusType.UnderReview]: 'error',
  [IncidentReportStatusType.Replaced]: 'warning',
  [IncidentReportStatusType.New]: 'error',
  [IncidentReportStatusType.Resolved]: 'success',
};
