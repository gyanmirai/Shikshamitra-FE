export enum ResourceOrderStatusType {
  Pending,
  'Order Placed',
  'Order Delivered',
  'Order Return',
}

export const ResourceOrderStatusTypeOptions = [
  {
    label: 'Pending',
    value: ResourceOrderStatusType.Pending,
  },
  {
    label: 'Order Placed',
    value: ResourceOrderStatusType['Order Placed'],
  },
  {
    label: 'Order Delivered',
    value: ResourceOrderStatusType['Order Delivered'],
  },
  {
    label: 'Order Return',
    value: ResourceOrderStatusType['Order Return'],
  },
];

export const ResourceOrderStatusTypeColors = {
  [ResourceOrderStatusType.Pending]: 'warning',
  [ResourceOrderStatusType['Order Placed']]: 'info',
  [ResourceOrderStatusType['Order Delivered']]: 'success',
  [ResourceOrderStatusType['Order Return']]: 'error',
};
