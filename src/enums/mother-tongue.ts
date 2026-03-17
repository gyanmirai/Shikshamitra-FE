export enum MotherTongueType {
  English,
  Hindi,
  Gujarati,
  Marathi,
  Tamil,
  Telugu,
  Kannada,
  Malayalam,
  Other,
}

export const MotherTongueTypeArray = Object.values(MotherTongueType).filter(
  (value) => typeof value === 'string'
);
