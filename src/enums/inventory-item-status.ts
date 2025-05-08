export enum InventoryItemStatusType {
  Good,
  Damaged,
  UnderMaintenance,
  New,
  Disposed,
}

export const InventoryItemStatusOptions = [
  {
    label: 'Good',
    value: InventoryItemStatusType.Good,
  },
  {
    label: 'Damaged',
    value: InventoryItemStatusType.Damaged,
  },
  {
    label: 'Under Maintenance',
    value: InventoryItemStatusType.UnderMaintenance,
  },
  {
    label: 'New',
    value: InventoryItemStatusType.New,
  },
  {
    label: 'Disposed',
    value: InventoryItemStatusType.Disposed,
  },
];

export const InventoryItemStatusTypeColor = {
  [InventoryItemStatusType.Good]: 'success',
  [InventoryItemStatusType.Damaged]: 'error',
  [InventoryItemStatusType.UnderMaintenance]: 'warning',
  [InventoryItemStatusType.New]: 'info',
  [InventoryItemStatusType.Disposed]: 'default',
};
