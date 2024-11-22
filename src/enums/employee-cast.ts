export enum EmployeeCastType {
  General,
  OBC,
  SC,
  ST,
}

export const EmployeeCastTypeArray = Array.from(
  Array(Object.keys(EmployeeCastType).length / 2).keys()
);
