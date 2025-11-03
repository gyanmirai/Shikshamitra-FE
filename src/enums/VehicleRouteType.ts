export enum VehicleRouteType {
  Current,
  Completed,
}

export const VehicleRouteTypeColor: Record<VehicleRouteType, string> = {
  [VehicleRouteType.Current]: 'info',
  [VehicleRouteType.Completed]: 'success',
};

export const VehicleRouteTypeOptions = [
  { label: 'Current', value: VehicleRouteType.Current },
  { label: 'Completed', value: VehicleRouteType.Completed },
];
