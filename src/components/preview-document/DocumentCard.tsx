import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Card, Tooltip, Typography, IconButton } from '@mui/material';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import { SingleFilePreview } from '../upload';
import CustomTooltip from '../custom-tooltip';
import { fileData, FileThumbnail } from '../file-thumbnail';

interface DocumentCardProps {
  file: any;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ file }) => {
  const viewDialog = useBoolean();

  const [previewFile, setPreviewFile] = useState<File | string | null>(null);

  const handleDownload = () => {
    const fileUrl = file instanceof File ? URL.createObjectURL(file) : file?.url || file;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL if it was created from a File object
    if (file instanceof File) {
      URL.revokeObjectURL(fileUrl);
    }
  };

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
        <FileThumbnail
          file={normalizeFileForThumbnail(file)}
          sx={{ height: '25px', width: '25px' }}
        />

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
            {file.size || 'Unknown size'} • 12-02-2025
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
                setPreviewFile(file);
              }}
            >
              <Iconify icon={GlobalIcons.eye} sx={{ width: 16, height: 16 }} />
            </IconButton>
          </Tooltip>
          {file && (
            <Tooltip title="Download">
              <IconButton size="small" onClick={handleDownload}>
                <Iconify icon={GlobalIcons.download} sx={{ width: 16, height: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          setPreviewFile(null);
          viewDialog.onFalse();
        }}
        title={previewFile ? fileData(previewFile).name : ''}
        maxWidth="sm"
      >
        <Scrollbar sx={{ height: 600, maxHeight: '100%' }}>
          {previewFile && <SingleFilePreview file={normalizeFileForThumbnail(previewFile)} />}
        </Scrollbar>
      </CustomDialog>
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
