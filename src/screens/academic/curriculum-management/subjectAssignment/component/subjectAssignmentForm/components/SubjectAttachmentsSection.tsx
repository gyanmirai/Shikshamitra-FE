import type { FileData } from 'src/components/custom-upload';

import { GlobalIcons } from 'src/utils/icons';
import FileUploader from 'src/components/custom-upload';
import { FormSectionCard } from 'src/components/form-section-card';

type Props = {
  documents?: (File | string | FileData)[];
  isUploading: boolean;
  getFileName: (file: string | File) => string;
  onChange: (files: (File | FileData)[]) => void;
  onPreview: (url: string) => void;
};

export function SubjectAttachmentsSection({
  documents,
  isUploading,
  getFileName,
  onChange,
  onPreview,
}: Props) {
  return (
    <FormSectionCard
      title="Attachments"
      icon={GlobalIcons.documentIcon}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip="Upload and preview documents that support this subject allocation."
    >
      <FileUploader
        multiple
        showVisibleDocumentCount={6}
        value={documents?.map((doc) =>
          typeof doc === 'string'
            ? { url: doc, filePath: doc, name: getFileName(doc), size: undefined }
            : doc
        )}
        onChange={onChange}
        isLoading={isUploading}
        onPreview={(file) =>
          onPreview(
            file instanceof File ? URL.createObjectURL(file) : file.url || file.filePath || ''
          )
        }
        primaryText="Drag & drop documents here, or click to upload"
      />
    </FormSectionCard>
  );
}
