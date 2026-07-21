import type { BoxProps } from '@mui/material';
import type { DragEvent, ChangeEvent } from 'react';

import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import {
  Box,
  Card,
  Stack,
  Button,
  Dialog,
  Tooltip,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { Iconify } from '../iconify';
import { shikshaMitraToast } from '../toast';
import CustomTooltip from '../custom-tooltip';
import { FileThumbnail } from '../file-thumbnail';

const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

export interface FileData {
  filePath: string | undefined;
  name: string;
  size?: number;
  type?: string;
  url?: string;
  base64?: string;
}

interface FileUploaderProps<T extends boolean = true> {
  primaryText?: string;
  secondaryText?: string;
  onChange: T extends true
    ? (files: (File | FileData)[]) => void
    : (files: File | FileData) => void;
  onPreview?: (file: File | FileData) => void;
  error?: string;
  multiple?: T;
  value?: T extends true ? (File | FileData)[] : File | FileData;
  propertyPr?: string;
  showVisibleDocumentCount?: number;
  parentsProps?: BoxProps;
  dragProps?: BoxProps;
}

const getAbsoluteFileUrl = (url: string) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const apiRoot = process.env.NEXT_PUBLIC_API_URL || '';

  // If the url is already prefixed with /api/files/ or api/files/
  if (url.includes('/api/files/')) {
    if (url.startsWith('/')) {
      return `${apiRoot}${url}`;
    }
    return `${apiRoot}/${url}`;
  }

  const cleanFilename = url.startsWith('/') ? url.slice(1) : url;

  if (cleanFilename.startsWith('api/')) {
    return `${apiRoot}/${cleanFilename}`;
  }
  return `${apiRoot}/api/files/${encodeURIComponent(cleanFilename)}`;
};

const getFileNameFromUrl = (file: string | File): string => {
  if (!file) return '';
  if (file instanceof File) return file.name;
  const parts = file.split('/');
  const nameWithGuid = parts[parts.length - 1];
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
  return nameWithGuid.replace(guidPattern, '');
};

const getFileType = (fileUrl: string): string => {
  const urlWithoutQuery = fileUrl.split('?')[0];
  const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') {
    return 'application/pdf';
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
    return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
  }
  return '';
};

const normalizeFile = (file: any): File | FileData => {
  if (typeof file === 'string') {
    const absoluteUrl = getAbsoluteFileUrl(file);
    return {
      url: absoluteUrl,
      filePath: absoluteUrl,
      name: getFileNameFromUrl(file),
      size: undefined,
      type: getFileType(file),
    };
  }

  if (file && typeof file === 'object' && !(file instanceof File)) {
    return {
      ...file,
      url: file.url ? getAbsoluteFileUrl(file.url) : file.url,
      filePath: file.filePath ? getAbsoluteFileUrl(file.filePath) : file.filePath,
    };
  }

  return file;
};

const FileUploader = <T extends boolean = true>({
  primaryText = 'Upload Files',
  secondaryText = '',
  onChange,
  onPreview,
  error,
  multiple = true as T,
  value,
  propertyPr,
  showVisibleDocumentCount = 3,
  parentsProps = {},
  dragProps = {},
}: FileUploaderProps<T>) => {
  const { sx: parentSx = {}, ...remainingProps } = parentsProps;
  const { sx = {}, ...dragRemainingProps } = dragProps;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const viewDialog = useBoolean();
  const [previewFile, setPreviewFile] = useState<File | FileData | null>(null);
  const [showAllDialog, setShowAllDialog] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const normalizedValue = React.useMemo(() => {
    if (!value) return value;
    if (Array.isArray(value)) {
      return value.map(normalizeFile);
    }
    return normalizeFile(value);
  }, [value]);

  const handlePreview = (file: File | FileData) => {
    if (onPreview) {
      onPreview(file);
    } else {
      setPreviewFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    handleFiles(multiple ? (dropped as any) : (dropped[0] as File));
  };

  const handleFiles = (newFile: T extends true ? File[] | FileData[] : File | FileData) => {
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB

    if (multiple) {
      const existingFiles = (value || []) as (File | FileData)[];
      const newFiles = Array.isArray(newFile) ? newFile : [newFile];
      const filteredFiles = newFiles.filter((file: File | FileData) => {
        const size = file instanceof File ? file.size : (file?.size ?? 0);
        if (size > maxSizeInBytes) {
          shikshaMitraToast.error({ message: `File exceeds the 5 MB size limit.` });
          return false;
        }
        if (file instanceof File) return allowedTypes.includes(file.type);
        if (file.type) return allowedTypes.includes(file.type);
        if (file.base64) {
          const mimeType = file.base64.split(';')[0].split(':')[1];
          return allowedTypes.includes(mimeType);
        }
        return true;
      });
      const updatedFiles = [...existingFiles, ...filteredFiles];
      onChange(updatedFiles as any);
    } else {
      let size = 0;

      if (newFile instanceof File) {
        // eslint-disable-next-line prefer-destructuring
        size = newFile.size;
      } else if (typeof newFile === 'object' && 'size' in newFile) {
        size = (newFile as FileData).size ?? 0;
      }

      if (size > maxSizeInBytes) {
        shikshaMitraToast.error({ message: 'File exceeds the 5 MB size limit.' });
        return;
      }
      onChange(newFile as any);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(multiple ? (Array.from(e.target.files) as any) : e.target.files[0]);
    }
  };

  const downloadFile = async (file: File | FileData) => {
    let url: string;
    if (file instanceof File) {
      url = URL.createObjectURL(file);
    } else if (file.base64) {
      url = file.base64;
    } else if (file.url) {
      url = file.url;
    } else {
      console.error('Invalid file format for download');
      return;
    }

    try {
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.warn('Failed to download file via fetch, opening in new tab as fallback:', err);
      window.open(url, '_blank');
    }
  };

  const removeFile = (index: number) => {
    if (Array.isArray(value)) {
      const newFiles = value.filter((_, i) => i !== index);
      onChange(newFiles as any);
    } else {
      onChange(null as any);
    }
  };

  const renderFileCard = (file: any, i: number) => (
    <Card
      key={i}
      variant="outlined"
      sx={{
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* <IconButton
        size="small"
        onClick={() => removeFile(i)}
        sx={{
          position: 'absolute',
          right: -7,
          top: -7,
          zIndex: 2,
          p: '1px',
          background: (theme) => theme.vars.palette.grey[200],
        }}
      >
        <Close sx={{ width: 16, height: 16 }} />
      </IconButton> */}

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FileThumbnail
          file={file instanceof File ? file : file?.url || file?.filePath || ''}
          sx={{ height: 25, width: 25 }}
        />
        <Box sx={{ ml: 1.5, flex: 1 }}>
          <Tooltip title={file.name}>
            <Typography
              variant="body2"
              sx={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {file.name}
            </Typography>
          </Tooltip>
          <Typography variant="caption" color="text.secondary">
            {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <CustomTooltip title="Preview">
            <IconButton size="small" onClick={() => handlePreview(file)}>
              <Iconify icon={GlobalIcons.eye} sx={{ width: 16, height: 16 }} />
            </IconButton>
          </CustomTooltip>
          <CustomTooltip title="Download">
            <IconButton size="small" onClick={() => downloadFile(file)}>
              <Iconify icon={GlobalIcons.download} sx={{ width: 16, height: 16 }} />
            </IconButton>
          </CustomTooltip>
          <CustomTooltip title="Remove">
            <IconButton size="small" onClick={() => removeFile(i)} sx={{ color: 'error.main' }}>
              <Iconify icon={GlobalIcons.delete} sx={{ width: 16, height: 16 }} />
            </IconButton>
          </CustomTooltip>
        </Box>
      </Box>
    </Card>
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasFiles = Array.isArray(value) ? value.length > 0 : !!value;

  return (
    <Box sx={{ height: '100%', ...parentSx }} {...remainingProps}>
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          border: (theme) =>
            `1px dashed ${error ? theme.palette.error.main : theme.vars.palette.grey[400]}`,
          padding: value && (Array.isArray(value) ? value.length > 0 : value) ? 1 : 2,
          borderRadius: 2,
          textAlign: value && (Array.isArray(value) ? value.length > 0 : value) ? 'left' : 'center',
          cursor: 'pointer',
          backgroundColor: error ? 'error.lighter' : 'transparent',
          transition: 'all 0.3s ease-in-out',
          display: 'flex',
          justifyContent: 'center',
          // height: '100%',
          // flexDirection: !value || (Array.isArray(value) && value.length === 0) ? 'row' : 'column',
          alignItems: 'center',
          gap: 2,
          height: value && (Array.isArray(value) ? value.length > 0 : value) ? 'auto' : '150px',
          ...sx,
        }}
        onClick={() => fileInputRef.current?.click()}
        {...dragRemainingProps}
      >
        <Iconify
          icon="eva:cloud-upload-fill"
          width={value && (Array.isArray(value) ? value.length > 0 : value) ? 24 : 28}
          sx={{
            color: error ? 'error.main' : 'default.main',
            transition: 'all 0.3s ease-in-out',
            // p: 2,
            borderRadius: 1,
          }}
        />
        {(!value || (Array.isArray(value) && value.length === 0)) && (
          <Stack spacing={1}>
            <Typography variant="body2">{primaryText}</Typography>
            {secondaryText && (
              <Typography color={error ? 'error' : 'text.secondary'} variant="caption">
                {secondaryText}
              </Typography>
            )}
            {propertyPr && (
              <Typography color="text.secondary" variant="caption">
                {propertyPr}
              </Typography>
            )}
            {error && (
              <Typography color="error" variant="caption">
                {error}
              </Typography>
            )}
          </Stack>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          multiple={multiple}
          hidden
          onChange={handleFileInput}
        />
      </Box>
      {(Array.isArray(normalizedValue) ? normalizedValue.length > 0 : normalizedValue) && (
        <Stack spacing={1} mt={2}>
          {Array.isArray(normalizedValue) && normalizedValue.slice(0, showVisibleDocumentCount).map(renderFileCard)}

          {Array.isArray(normalizedValue) && normalizedValue.length > showVisibleDocumentCount && (
            <Button variant="outlined" onClick={() => setShowAllDialog(true)}>
              View All Files ({normalizedValue.length})
            </Button>
          )}
          {!Array.isArray(normalizedValue) && normalizedValue && renderFileCard(normalizedValue, 0)}
        </Stack>
      )}

      <Dialog open={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          {previewFile?.name}
          <IconButton
            onClick={() => setPreviewFile(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {(() => {
            let previewUrl = '';
            if (previewFile instanceof File) {
              previewUrl = URL.createObjectURL(previewFile);
            } else if (previewFile?.base64) {
              previewUrl = previewFile.base64;
            } else if (previewFile?.url) {
              previewUrl = previewFile.url;
            }

            const fileType = previewFile instanceof File ? previewFile.type : previewFile?.type;

            if (fileType?.startsWith('image/')) {
              return (
                <img
                  src={previewUrl}
                  alt={previewFile?.name}
                  style={{ width: '100%', objectFit: 'cover' }}
                  onLoad={() => {
                    if (previewFile instanceof File) {
                      URL.revokeObjectURL(previewUrl);
                    }
                  }}
                />
              );
            }
            if (fileType === 'application/pdf') {
              return <embed src={previewUrl} type="application/pdf" width="100%" height="600px" />;
            }
            return <Typography>Unsupported file type</Typography>;
          })()}
        </DialogContent>
      </Dialog>

      <Dialog open={showAllDialog} onClose={() => setShowAllDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          All Uploaded Files
          <IconButton
            onClick={() => setShowAllDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>{Array.isArray(normalizedValue) && normalizedValue.map(renderFileCard)}</Stack>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => {
              setShowAllDialog(false);
            }}
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploader;
