export type ChapterDocument = string | File;

export const buildChapterMultipartPayload = <TPayload extends object>(
  payload: TPayload,
  documents: ChapterDocument[] = []
): FormData => {
  const formData = new FormData();
  const existingDocuments = documents.filter(
    (document): document is string => typeof document === 'string' && Boolean(document)
  );

  formData.append('Payload', JSON.stringify({ ...payload, documents: existingDocuments }));

  documents.forEach((document) => {
    if (document instanceof File) {
      formData.append('Files', document, document.name);
    }
  });

  return formData;
};
