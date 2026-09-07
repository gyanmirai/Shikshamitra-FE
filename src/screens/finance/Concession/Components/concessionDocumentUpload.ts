import { ConcessionDocumentFormat } from '../../settings/ConcessionTypeSetting/type';

const formatExtensions: Record<number, string[]> = {
  [ConcessionDocumentFormat.Jpg]: ['.jpg'],
  [ConcessionDocumentFormat.Jpeg]: ['.jpeg'],
  [ConcessionDocumentFormat.Png]: ['.png'],
  [ConcessionDocumentFormat.Docx]: ['.docx'],
  [ConcessionDocumentFormat.Pdf]: ['.pdf'],
  [ConcessionDocumentFormat.Xlsx]: ['.xlsx'],
};

export const getAcceptedExtensions = (document: any): string[] =>
  (document?.acceptedFormats || []).flatMap(
    (format: number) => formatExtensions[format] || []
  );

export const getFileAccept = (document: any): string =>
  getAcceptedExtensions(document).join(',');

export const getDocumentConstraintText = (document: any): string => {
  const formats = getAcceptedExtensions(document)
    .map((extension) => extension.slice(1).toUpperCase())
    .join(', ');
  const maxSizeMb = Number(document?.maxFileSizeBytes || 0) / (1024 * 1024);
  return `${document?.isRequired ? 'Mandatory' : 'Optional'} · ${formats || 'Configured formats'} · Max ${maxSizeMb} MB`;
};

export const validateConcessionDocumentFile = (file: File, document: any): string | null => {
  if (file.size > Number(document?.maxFileSizeBytes || 0)) {
    return `File exceeds the ${Number(document.maxFileSizeBytes) / (1024 * 1024)} MB limit.`;
  }

  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (!getAcceptedExtensions(document).includes(extension)) {
    return `Allowed formats: ${getAcceptedExtensions(document)
      .map((value) => value.slice(1).toUpperCase())
      .join(', ')}.`;
  }

  return null;
};
