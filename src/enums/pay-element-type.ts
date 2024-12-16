export enum PayElementType {
  Credit,
  Debit,
}

export const PayElementTypeArray = Array.from(
  Array(Object.keys(PayElementType).length / 2).keys()
).map((i) => ({ label: PayElementType[i], value: i }));
