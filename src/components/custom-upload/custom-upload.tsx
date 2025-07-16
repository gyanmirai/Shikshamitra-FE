import { useDropzone } from 'react-dropzone';
import React, { useState, useCallback } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Grid, Card, CardMedia, Typography, IconButton, DialogContent } from '@mui/material';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';

interface FileWithPreview extends File {
  preview?: string;
  url?: string;
  base64?: string;
}

type OutputFormat = 'url' | 'base64' | 'file';

interface CustomUploadProps {
  multiple?: boolean;
  previewCount?: number;
  value?: (FileWithPreview | string)[];
  onChange?: (files: (FileWithPreview | string)[]) => void;
  onDelete?: (file: FileWithPreview | string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  outputFormat?: OutputFormat;
  secondaryText?: string;
}

const CustomUpload: React.FC<CustomUploadProps> = ({
  multiple = false,
  previewCount = 3,
  value = [],
  onChange,
  onDelete,
  error = false,
  helperText = '',
  label = 'Drag & drop files here, or click to select files',
  outputFormat = 'file',
  secondaryText = '',
}) => {
  const [files, setFiles] = useState<(FileWithPreview | string)[]>(value);
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    file?: FileWithPreview | string;
  }>({ open: false });
  const [filesDialog, setFilesDialog] = useState(false);

  const convertFileToFormat = async (
    file: File,
    format: OutputFormat
  ): Promise<FileWithPreview | string> => {
    if (format === 'file') {
      return Object.assign(file, { preview: URL.createObjectURL(file) });
    }

    if (format === 'url') {
      return URL.createObjectURL(file);
    }

    // Convert to base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = await Promise.all(
        acceptedFiles.map((file) => convertFileToFormat(file, outputFormat))
      );

      const updatedFiles = multiple ? [...files, ...newFiles] : newFiles.slice(0, 1);

      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, multiple, onChange, outputFormat]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
  });

  const handleDelete = (file: FileWithPreview | string) => {
    const updatedFiles = files.filter((f) => f !== file);
    setFiles(updatedFiles);
    onDelete?.(file);
    onChange?.(updatedFiles);
  };

  const handlePreview = (file: FileWithPreview | string) => {
    setPreviewDialog({ open: true, file });
  };

  const getFilePreview = (file: FileWithPreview | string) => {
    if (typeof file === 'string') {
      return file.startsWith('data:') ? file : file; // Base64 or URL
    }
    return file.preview || '';
  };

  const renderFilePreview = (file: FileWithPreview | string) => (
    <Box sx={{ position: 'relative', m: 1 }}>
      {/* Close Icon Button outside Card */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleDelete(file);
        }}
        sx={{
          position: 'absolute',
          top: -6,
          right: -6,
          zIndex: 2,
          bgcolor: 'rgba(241, 241, 241, 0.8)',
          border: '1px solid #ccc',
          width: 20,
          height: 20,
          '&:hover': {
            bgcolor: 'rgba(241, 241, 241, 1)',
          },
        }}
      >
        <CloseIcon fontSize="small" sx={{ width: 14, height: 14 }} />
      </IconButton>

      <Card
        sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #ccc',
          cursor: 'pointer',
        }}
        onClick={() => handlePreview(file)}
      >
        <CardMedia
          component="img"
          image={getFilePreview(file)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Card>
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        {...getRootProps()}
        sx={{
          border: (theme) =>
            `1px dashed ${error ? theme.palette.error.main : theme.palette.grey[300]}`,
          borderRadius: 2,
          p: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <input {...getInputProps()} />
        <Typography
          color={error ? 'error.main' : 'textSecondary'}
          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <Iconify
            icon="eva:cloud-upload-fill"
            width={28}
            sx={{
              color: error ? 'error.main' : 'default.main',
              transition: 'all 0.3s ease-in-out',
              // p: 2,
              borderRadius: 1,
            }}
          />{' '}
          {isDragActive ? 'Drop files here...' : label}
        </Typography>
        {secondaryText && (
          <Typography
            variant="caption"
            color={error ? 'error.main' : 'textSecondary'}
            sx={{ mt: 1, display: 'block' }}
          >
            {secondaryText}
          </Typography>
        )}
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          color={error ? 'error.main' : 'textSecondary'}
          sx={{ mt: 1, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}

      {files.length > 0 && (
        <Box mt={2}>
          <Grid container spacing={2}>
            {files.slice(0, previewCount).map((file, index) => (
              <Grid item key={index}>
                {renderFilePreview(file)}
              </Grid>
            ))}
          </Grid>
          {files.length > previewCount && (
            <Box mt={1}>
              <Typography
                variant="body2"
                color="primary"
                sx={{ cursor: 'pointer' }}
                onClick={() => setFilesDialog(true)}
              >
                +{files.length - previewCount} more files
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <CustomDialog
        open={previewDialog.open}
        handleClose={() => setPreviewDialog({ open: false })}
        maxWidth="md"
        fullWidth
        title="Preview"
      >
        <DialogContent>
          {previewDialog.file && (
            <Box
              component="img"
              src={getFilePreview(previewDialog.file)}
              sx={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
      </CustomDialog>

      <CustomDialog
        title="All Files"
        open={filesDialog}
        handleClose={() => setFilesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Grid container spacing={2}>
            {files.map((file, index) => (
              <Grid item key={index}>
                {renderFilePreview(file)}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </CustomDialog>
    </Box>
  );
};

export default CustomUpload;
