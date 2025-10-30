// enums/transport_status.ts

export enum RouteStatus {
  Active,
  Inactive,
}

// Status colors for <Label> components
export const RouteStatusColor = {
  [RouteStatus.Active]: 'success',
  [RouteStatus.Inactive]: 'error',
};

// Dropdown / filter options for table or forms
export const RouteStatusOptions = [
  { label: 'Active', value: RouteStatus.Active },
  { label: 'Inactive', value: RouteStatus.Inactive },
];
