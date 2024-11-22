export enum GenderType {
  Male,
  Female,
  Other,
}

export const GenderTypeArray = Array.from(Array(Object.keys(GenderType).length / 2).keys());
