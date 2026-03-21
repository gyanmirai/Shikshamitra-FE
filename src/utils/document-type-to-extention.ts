import { DocumentType } from 'src/enums/documnet-type';

export function getFileExtension(extension: string): number | null {
  switch (extension) {
    case './pg':
      return DocumentType.Jpg;
    case '.jpeg':
      return DocumentType.Jpeg;
    case '.png':
      return DocumentType.Png;
    case '.docx':
      return DocumentType.Docx;
    case '.pdf':
      return DocumentType.Pdf;
    case '.xlsx':
      return DocumentType.Xlsx;
    default:
      return null;
  }
}
