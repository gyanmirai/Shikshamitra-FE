export enum RouteType {
  'pickup',
  'drop',
  'both',
}

export const routeTypeOptions = [
  {
    id: '1',
    value: RouteType.pickup,
    label: 'Pickup',
  },
  {
    id: '2',
    value: RouteType.drop,
    label: 'Drop',
  },
  {
    id: '3',
    value: RouteType.both,
    label: 'Both',
  },
];
