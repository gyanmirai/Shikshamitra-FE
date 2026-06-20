export enum DeliveryStatus {
  Queued = 0,
  Sent = 1,
  Delivered = 2,
  Read = 3,
  Failed = 4,
  Bounced = 5,
  Replied = 6,
  Acknowledged = 7,
  Skipped = 8,
}

export const DeliveryStatusColor: Record<DeliveryStatus, string> = {
  [DeliveryStatus.Queued]: 'info',
  [DeliveryStatus.Sent]: 'secondary',
  [DeliveryStatus.Delivered]: 'success',
  [DeliveryStatus.Read]: 'success',
  [DeliveryStatus.Failed]: 'error',
  [DeliveryStatus.Bounced]: 'error',
  [DeliveryStatus.Replied]: 'primary',
  [DeliveryStatus.Acknowledged]: 'success',
  [DeliveryStatus.Skipped]: 'warning',
};

export const DeliveryStatusOptions = [
  { label: 'Queued', value: DeliveryStatus.Queued },
  { label: 'Sent', value: DeliveryStatus.Sent },
  { label: 'Delivered', value: DeliveryStatus.Delivered },
  { label: 'Read', value: DeliveryStatus.Read },
  { label: 'Failed', value: DeliveryStatus.Failed },
  { label: 'Bounced', value: DeliveryStatus.Bounced },
  { label: 'Replied', value: DeliveryStatus.Replied },
  { label: 'Acknowledged', value: DeliveryStatus.Acknowledged },
  { label: 'Skipped', value: DeliveryStatus.Skipped },
];
