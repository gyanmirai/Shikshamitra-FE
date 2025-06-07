export enum DocumentType {
  Jpg,
  Jpeg,
  Png,
  Docx,
  Pdf,
  Xlsx,
}

export const DocumentFileType = {
  Jpg: 'image/jpeg',
  Jpeg: 'image/jpeg',
  Png: 'image/png',
  Docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  Pdf: 'application/pdf',
  Xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};
export const DocumentTypeArray = Array.from(Array(Object.keys(DocumentType).length / 2).keys()).map(
  (i) => ({ label: DocumentType[i], value: i })
);

export const convertFileAcceptType = (acceptedFiles: DocumentType[]) => {
  let accept = '';
  acceptedFiles.forEach((item, index) => {
    accept += `${DocumentFileType[DocumentType[item] as keyof typeof DocumentFileType]},`;
  });
  return accept;
};
