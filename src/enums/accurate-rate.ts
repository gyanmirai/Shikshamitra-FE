export enum AccurateRateType {
  Yearly,
  Monthly,
  Quarterly,
}

export const AccurateRateTypeArray = Array.from(
  Array(Object.keys(AccurateRateType).length / 2).keys()
).map((i) => ({ label: AccurateRateType[i], value: i }));
