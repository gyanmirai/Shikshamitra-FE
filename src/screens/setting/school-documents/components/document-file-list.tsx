import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Stack, Button, Tooltip, Typography, IconButton } from '@mui/material';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { useDownloadSchoolDocumentMutation } from 'src/redux/InstituteSetup/schoolDocumentsApi';

import { schoolDocumentError } from '../document-form';

import type { SchoolDocumentFile } from '../types';

export function DocumentFileList({
  documentId,
  files,
  onRemove,
  disabled = false,
}: {
  documentId: string;
  files: SchoolDocumentFile[];
  onRemove?: (fileId: string) => void;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<SchoolDocumentFile | null>(null);
  const [download, downloadState] = useDownloadSchoolDocumentMutation();
  const downloadFile = async (file: SchoolDocumentFile) => {
    try {
      const blob = await download({ id: documentId, fileId: file.id }).unwrap();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      shikshaMitraToast.error({ message: schoolDocumentError(error) });
    }
  };
  return (
    <Stack spacing={1}>
      {files.map((file) => (
        <Stack
          key={file.id}
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'center' }}
          sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
        >
          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {file.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024).toFixed(1)} KB
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              size="small"
              disabled={disabled}
              onClick={() => setPreview(file)}
              aria-label={`Preview ${file.fileName}`}
              startIcon={<Iconify icon={GlobalIcons.eye} />}
            >
              Preview
            </Button>
            <Button
              size="small"
              disabled={disabled || downloadState.isLoading}
              aria-label={`Download ${file.fileName}`}
              loading={downloadState.isLoading && downloadState.originalArgs?.fileId === file.id}
              onClick={() => {
                downloadFile(file);
              }}
              startIcon={<Iconify icon={GlobalIcons.download} />}
            >
              Download
            </Button>
            {onRemove && (
              <Tooltip title={`Remove ${file.fileName}`}>
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={disabled}
                    aria-label={`Remove ${file.fileName}`}
                    onClick={() => onRemove(file.id)}
                  >
                    <Iconify icon={GlobalIcons.delete} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      ))}
      {preview && (
        <DocumentPreviewDialog
          open
          onClose={() => setPreview(null)}
          documentName={preview.fileName}
          directUrl
          url={`/api/institute-setup/school-documents/${documentId}/files/${preview.id}`}
        />
      )}
    </Stack>
  );
}
