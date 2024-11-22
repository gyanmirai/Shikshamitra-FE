export enum MaritalStatusType {
  Unmarried,
  Married,
  Divorced,
  Widowed,
}

export const MaritalStatusTypeArray = Array.from(
  Array(Object.keys(MaritalStatusType).length / 2).keys()
);
