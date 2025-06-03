export enum GenderType {
  Male,
  Female,
}

export const GenderTypeArray = Array.from(Array(Object.keys(GenderType).length / 2).keys());
