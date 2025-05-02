export enum AuditStatusType {
  Verified,
  Pending,
  Disputed,
}

export enum AuditStatusTypeColor {
  Verified = 'success',
  Pending = 'warning',
  Disputed = 'error',
}

export const AuditStatusTypeOptions = [
  { label: 'Verified', value: AuditStatusType.Verified },
  { label: 'Pending', value: AuditStatusType.Pending },
  { label: 'Disputed', value: AuditStatusType.Disputed },
];
