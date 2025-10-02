export enum DeliveryStatus {
  Delivered,
  Failed,
}

export const DeliveryStatusColor: Record<DeliveryStatus, string> = {
  [DeliveryStatus.Delivered]: 'success',
  [DeliveryStatus.Failed]: 'error',
};

export const DeliveryStatusOptions = [
  { label: 'Delivered', value: DeliveryStatus.Delivered },
  { label: 'Failed', value: DeliveryStatus.Failed },
];
