// enums/transport_status.ts

export enum TransportStatus {
  Pending,
  Approve,
  Reject,
  Hold,
  Cancelled,
}

// Status colors for <Label> components
export const TransportStatusColor = {
  [TransportStatus.Pending]: 'warning',
  [TransportStatus.Approve]: 'success',
  [TransportStatus.Reject]: 'error',
  [TransportStatus.Hold]: 'info',
  [TransportStatus.Cancelled]: 'default',
};

// Dropdown / filter options for table or forms
export const TransportStatusOptions = [
  { label: 'Pending', value: TransportStatus.Pending },
  { label: 'Approve', value: TransportStatus.Approve },
  { label: 'Reject', value: TransportStatus.Reject },
  { label: 'Hold', value: TransportStatus.Hold },
  { label: 'Cancelled', value: TransportStatus.Cancelled },
];
