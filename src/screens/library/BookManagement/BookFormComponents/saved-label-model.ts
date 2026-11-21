export type SavedLabel = {
  copyId: string;
  copyNumber: number;
  accessionNumber: string;
  barcodeValue: string;
  sectionName: string;
  shelfName: string;
};
export const savedLabelValidationKey = (label: SavedLabel) =>
  JSON.stringify([label.copyId, label.barcodeValue]);
