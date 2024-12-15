export enum DocumentType {
  Jpg,
  Jpeg,
  Png,
  Docx,
  Pdf,
  Xlsx,
}
export const DocumentTypeArray = Array.from(Array(Object.keys(DocumentType).length / 2).keys()).map(
  (i) => ({ label: DocumentType[i], value: i })
);
