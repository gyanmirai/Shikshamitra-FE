import * as Yup from 'yup';

export type DocumentAction = 'upload' | 'original' | 'accept' | 'reject' | 'waive';
export type DocumentActionValues = { file: File | null; notes: string };
export const documentActionLabels: Record<DocumentAction, string> = {
  upload: 'Upload document',
  original: 'Record physical original',
  accept: 'Accept document',
  reject: 'Request replacement',
  waive: 'Waive requirement',
};
export function documentActionSchema(
  action: DocumentAction,
  extensions: string[],
  maxFileSizeMb: number
) {
  const file = Yup.mixed<File>()
    .nullable()
    .test(
      'required-file',
      'Choose a document to upload',
      (value) => action !== 'upload' || value instanceof File
    )
    .test(
      'file-size',
      `Choose a file no larger than ${maxFileSizeMb} MB`,
      (value) => !value || value.size <= maxFileSizeMb * 1024 * 1024
    )
    .test(
      'file-extension',
      `Allowed formats: ${extensions.join(', ')}`,
      (value) =>
        !value ||
        extensions
          .map((extension) => extension.replace(/^\./, '').toLowerCase())
          .includes(value.name.split('.').at(-1)?.toLowerCase() ?? '')
    );
  const notes = Yup.string().trim().max(1024, 'Use 1,024 characters or fewer');
  return Yup.object({
    file,
    notes: ['original', 'reject', 'waive'].includes(action)
      ? notes.required(
          action === 'original'
            ? 'Describe the original document you checked'
            : 'Give a reason for this decision'
        )
      : notes,
  });
}
