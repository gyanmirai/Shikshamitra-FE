import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Tooltip, Typography, IconButton, CircularProgress } from '@mui/material';
import { useGetCurriculumFileByNameMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';
import { FileThumbnail } from '../file-thumbnail';
import DocumentPreviewDialog from './DocumentPreviewDialog';

interface DocumentCardProps {
  file: any;
}

const getFileNameFromUrl = (url: string): string => {
  if (!url) return '';
  const normalized = url.split('?')[0];
  const segments = normalized.split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] || '');
};

const DocumentCard: React.FC<DocumentCardProps> = ({ file }) => {
  const viewDialog = useBoolean();
  const [failedThumbnailFile, setFailedThumbnailFile] = useState<File | string | null>(null);
  const thumbnailFile = normalizeFileForThumbnail(file);

  const [getFile, { isLoading: isDownloading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useGetCurriculumFileByNameMutation,
    popupConfig: { error: true, errorMessage: 'Unable to download file.', success: false },
  });

  const handleDownload = async () => {
    const rawUrl = file instanceof File ? URL.createObjectURL(file) : file?.url || file;

    if (!rawUrl) return;

    if (
      file instanceof File ||
      rawUrl.startsWith('blob:') ||
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://')
    ) {
      const link = document.createElement('a');
      link.href = rawUrl;
      link.download = file.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (file instanceof File && !rawUrl.startsWith('blob:')) {
        URL.revokeObjectURL(rawUrl);
      }
      return;
    }

    try {
      const fileName = getFileNameFromUrl(rawUrl);
      const blob = await getFile(fileName).unwrap();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name || fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const fileUrl = file instanceof File ? URL.createObjectURL(file) : file?.url || file;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        '&:hover': {
          boxShadow: 1,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {failedThumbnailFile === thumbnailFile ? (
          <Iconify icon={GlobalIcons.documentIcon} width={25} aria-hidden />
        ) : (
          <FileThumbnail
            file={thumbnailFile}
            sx={{ height: '25px', width: '25px' }}
            onErrorCapture={() => setFailedThumbnailFile(thumbnailFile)}
          />
        )}

        <Box sx={{ ml: 1.5, flex: 1 }}>
          <CustomTooltip title={file.name} sx={{ textAlign: 'justify' }}>
            <Typography
              variant="body2"
              noWrap
              sx={{
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {file.name}
            </Typography>
          </CustomTooltip>

          <Typography variant="caption" color="text.secondary">
            {file.size || 'Unknown size'}
          </Typography>
        </Box>
        <Box
          className="document-actions"
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'opacity 0.2s ease',
          }}
        >
          <Tooltip title="Preview">
            <IconButton
              size="small"
              onClick={() => {
                viewDialog.onTrue();
              }}
            >
              <Iconify icon={GlobalIcons.eye} sx={{ width: 16, height: 16 }} />
            </IconButton>
          </Tooltip>
          {file && (
            <Tooltip title="Download">
              <IconButton size="small" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Iconify icon={GlobalIcons.download} sx={{ width: 16, height: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <DocumentPreviewDialog
        open={viewDialog.value}
        onClose={viewDialog.onFalse}
        url={fileUrl}
        documentName={file.name}
      />
    </Card>
  );
};

export default DocumentCard;

function normalizeFileForThumbnail(file: any): string | File {
  if (file instanceof File) return file;

  if (typeof file === 'string') return file;

  // if it's an object from the documentsList
  if (file?.url) return file.url;

  return ''; // fallback
}
