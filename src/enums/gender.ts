export enum GenderType {
  Male,
  Female,
}

export const GenderOptions = [
  {
    label: 'Male',
    value: GenderType[0],
  },
  {
    label: 'Female',
    value: GenderType[1],
  },
];
export const GenderTypeArray = Array.from(Array(Object.keys(GenderType).length / 2).keys());
