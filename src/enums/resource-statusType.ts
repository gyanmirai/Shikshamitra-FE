export enum ResourceStatusType {
  'In use',
  'Under Review',
  'Under Maintenance',
  Disposed,
}

export const ResourceStatusTypeOptions = [
  {
    label: 'Disposed',
    value: ResourceStatusType.Disposed,
  },
  {
    label: 'Under Maintenance',
    value: ResourceStatusType['Under Maintenance'],
  },
  {
    label: 'In Use',
    value: ResourceStatusType['In use'],
  },
  {
    label: 'Under Review',
    value: ResourceStatusType['Under Review'],
  },
];

export const ResourceStatusTypeColors = {
  [ResourceStatusType['In use']]: 'success',
  [ResourceStatusType['Under Maintenance']]: 'warning',
  [ResourceStatusType['Under Review']]: 'info',
  [ResourceStatusType.Disposed]: 'error',
};
