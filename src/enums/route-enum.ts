export enum RouteStatusType {
  Active,
  Inactive,
}

export const RouteStatusTypeColor: Record<RouteStatusType, string> = {
  [RouteStatusType.Active]: 'success',
  [RouteStatusType.Inactive]: 'error',
};

export const RouteStatusOptions = [
  { label: 'Active', value: RouteStatusType.Active },
  { label: 'Inactive', value: RouteStatusType.Inactive },
];
