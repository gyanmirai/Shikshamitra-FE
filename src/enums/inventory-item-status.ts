export enum InventoryItemStatusType {
  'In Use',
  Available,
  'Partially Issued',
}

export const InventoryItemStatusOptions = [
  {
    label: 'Available',
    value: InventoryItemStatusType.Available,
  },
  {
    label: 'In Use',
    value: InventoryItemStatusType['In Use'],
  },
  {
    label: 'Partially Issued',
    value: InventoryItemStatusType['Partially Issued'],
  },
];

export const InventoryItemStatusTypeColor = {
  [InventoryItemStatusType.Available]: 'success',
  [InventoryItemStatusType['In Use']]: 'error',
  [InventoryItemStatusType['Partially Issued']]: 'warning',
};
