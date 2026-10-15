import { Close } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  Dialog,
  CardMedia,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { Iconify } from '../iconify';
import { BannerUpload } from './banner-upload';

export interface FileWithPreview extends File {
  preview?: string;
  url?: string;
  base64?: string;
}

type OutputFormat = 'url' | 'base64' | 'file';

export interface CustomUploadProps {
  variant?: 'default' | 'banner';
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
  multiple?: boolean;
  previewCount?: number;
  value?: (FileWithPreview | string)[];
  onChange?: (files: (FileWithPreview | string)[]) => void;
  onDelete?: (file: FileWithPreview | string) => void;
  onPreview?: (file: FileWithPreview | string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  outputFormat?: OutputFormat;
  secondaryText?: string;
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
}

const DefaultUpload: React.FC<CustomUploadProps> = ({
  multiple = false,
  previewCount = 3,
  value = [],
  onChange,
  onDelete,
  onPreview,
  error = false,
  helperText = '',
  label = 'Drag & drop files here, or click to select files',
  outputFormat = 'file',
  secondaryText = '',
}) => {
  const [files, setFiles] = useState<(FileWithPreview | string)[]>(
    Array.isArray(value) ? value : value ? [value] : []
  );

  React.useEffect(() => {
    setFiles(Array.isArray(value) ? value : value ? [value] : []);
  }, [value]);

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

      const updatedFiles = multiple
        ? [...files, ...newFiles]
        : newFiles.length
          ? [newFiles[0]]
          : [];

      setFiles(updatedFiles);
      onChange?.(updatedFiles);
    },
    [files, multiple, onChange, outputFormat]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles: multiple ? undefined : 1,
  });

  const handleDelete = (file: FileWithPreview | string) => {
    const updatedFiles = files.filter((f) => f !== file);
    setFiles(updatedFiles);
    onDelete?.(file);
    onChange?.(updatedFiles);
  };

  const handlePreview = (file: FileWithPreview | string) => {
    if (onPreview) {
      onPreview(file);
    } else {
      setPreviewDialog({ open: true, file });
    }
  };

  const getFilePreview = (file: FileWithPreview | string) => {
    if (typeof file === 'string') {
      // keep existing logic intact — just add HTTPS safety layer
      let safeUrl = file;

      // auto-convert http:// to https:// (OpenLibrary etc.)
      if (safeUrl.startsWith('http://')) {
        safeUrl = safeUrl.replace('http://', 'https://');
      }

      // existing check (base64 or URL)
      return safeUrl.startsWith('data:') ? safeUrl : safeUrl;
    }

    // unchanged fallback for File objects
    return file.preview || '';
  };

  const renderFilePreview = (file: FileWithPreview | string) => {
    const isImage =
      typeof file === 'string' ? file.includes('image/') : file.type.startsWith('image/');

    const isUrlOfImage =
      typeof file === 'string' &&
      (file.startsWith('http://') || file.startsWith('https://')) &&
      isImageUrl(file);
    return (
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
            '&:hover': { bgcolor: 'rgba(241, 241, 241, 1)' },
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
          {isImage || isUrlOfImage ? (
            <CardMedia
              component="img"
              image={getFilePreview(file)}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <CardMedia
              component={Iconify}
              icon="eva:file-text-outline"
              width={28}
              color={isImage || isUrlOfImage ? 'default.main' : 'action.active'}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        {...getRootProps()}
        sx={{
          border: (theme) =>
            `1px dashed ${error ? theme.palette.error.main : theme.vars.palette.grey[300]}`,
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
              <Grid key={index}>{renderFilePreview(file)}</Grid>
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

      {/* <Dialog open={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="md" fullWidth> */}

      <Dialog
        open={previewDialog.open}
        onClose={() => setPreviewDialog({ open: false, file: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Preview
          <IconButton
            onClick={() => setPreviewDialog({ open: false, file: '' })}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewDialog.file && (
            <>
              {typeof previewDialog.file === 'string' ? (
                // Handle string URLs/base64
                previewDialog.file.includes('application/pdf') ? (
                  <iframe
                    src={previewDialog.file}
                    style={{ width: '100%', height: '600px' }}
                    title="PDF Preview"
                  />
                ) : previewDialog.file.includes('image/') ||
                  ((previewDialog.file.startsWith('https://') ||
                    previewDialog.file.startsWith('http://')) &&
                    isImageUrl(previewDialog.file)) ? (
                  <Box
                    component="img"
                    src={previewDialog.file}
                    sx={{ width: '100%', height: 'auto' }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Document Preview Not Available
                    </Typography>
                    <Box
                      component="a"
                      href={previewDialog.file}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        textDecoration: 'none',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <Iconify icon="eva:download-outline" width={20} />
                      Download File
                    </Box>
                  </Box>
                )
              ) : // Handle File objects
              previewDialog.file.type === 'application/pdf' ? (
                <iframe
                  src={getFilePreview(previewDialog.file)}
                  style={{ width: '100%', height: '600px' }}
                  title="PDF Preview"
                />
              ) : previewDialog.file.type.startsWith('image/') ? (
                <Box
                  component="img"
                  src={getFilePreview(previewDialog.file)}
                  sx={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Document Preview Not Available
                  </Typography>
                  <Box
                    component="a"
                    href={getFilePreview(previewDialog.file)}
                    download={previewDialog.file.name}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 1,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                      textDecoration: 'none',
                      '&:hover': { bgcolor: 'primary.dark' },
                    }}
                  >
                    <Iconify icon="eva:download-outline" width={20} />
                    Download File
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={filesDialog && files.length > 1}
        onClose={() => setFilesDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          All Files
          <IconButton
            onClick={() => setFilesDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {files.map((file, index) => (
              <Grid key={index}>{renderFilePreview(file)}</Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const CustomUpload = ({ variant, ...props }: CustomUploadProps) =>
  variant === 'banner' ? <BannerUpload {...props} /> : <DefaultUpload {...props} />;

export default CustomUpload;
