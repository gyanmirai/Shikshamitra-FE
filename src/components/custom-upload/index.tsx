import type { DragEvent, ChangeEvent } from 'react';

import React, { useState } from 'react';

import { Close } from '@mui/icons-material';
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

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from '../iconify';
import CustomTooltip from '../custom-tooltip';
import { FileThumbnail } from '../file-thumbnail';

const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

interface FileData {
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
  error?: string;
  multiple?: T;
  value?: T extends true ? (File | FileData)[] : File | FileData;
  propertyPr?: string;
}

const FileUploader = <T extends boolean = true>({
  primaryText = 'Upload Files',
  secondaryText = '',
  onChange,
  error,
  multiple = true as T,
  value,
  propertyPr,
}: FileUploaderProps<T>) => {
  const viewDialog = useBoolean();
  const [previewFile, setPreviewFile] = useState<File | FileData | null>(null);
  const [showAllDialog, setShowAllDialog] = useState<boolean>(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    handleFiles(multiple ? (dropped as any) : (dropped[0] as File));
  };

  const handleFiles = (newFile: T extends true ? File[] | FileData[] : File | FileData) => {
    if (multiple) {
      const existingFiles = (value || []) as (File | FileData)[];
      const newFiles = Array.isArray(newFile) ? newFile : [newFile];
      const filteredFiles = newFiles.filter((file: File | FileData) => {
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
      onChange(newFile as any);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(multiple ? (Array.from(e.target.files) as any) : e.target.files[0]);
    }
  };

  const downloadFile = (file: File | FileData) => {
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

    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    if (file instanceof File) {
      URL.revokeObjectURL(url);
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
          background: (theme) => theme.palette.grey[200],
        }}
      >
        <Close sx={{ width: 16, height: 16 }} />
      </IconButton> */}

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FileThumbnail file={normalizeFileForThumbnail(file)} sx={{ height: 25, width: 25 }} />
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
            <IconButton size="small" onClick={() => setPreviewFile(file)}>
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

  const hasFiles = Array.isArray(value) ? value.length > 0 : !!value;

  return (
    <Box sx={{ height: '100%' }}>
      <Box
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        sx={{
          border: (theme) =>
            `1px dashed ${error ? theme.palette.error.main : theme.palette.grey[400]}`,
          padding: value && (Array.isArray(value) ? value.length > 0 : value) ? 1 : 2,
          borderRadius: 2,
          textAlign: value && (Array.isArray(value) ? value.length > 0 : value) ? 'left' : 'center',
          cursor: 'pointer',
          backgroundColor: error ? 'error.lighter' : 'transparent',
          transition: 'all 0.3s ease-in-out',
          display: 'flex',
          justifyContent: 'center',
          // flexDirection: !value || (Array.isArray(value) && value.length === 0) ? 'row' : 'column',
          alignItems: 'center',
          gap: 2,
        }}
        onClick={() => document.getElementById('file-input')?.click()}
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
          id="file-input"
          type="file"
          accept={allowedTypes.join(',')}
          multiple={multiple}
          hidden
          onChange={handleFileInput}
        />
      </Box>
      <Stack spacing={1} mt={2}>
        {Array.isArray(value) && value.slice(0, 3).map(renderFileCard)}

        {Array.isArray(value) && value.length > 3 && (
          <Button variant="outlined" onClick={() => setShowAllDialog(true)}>
            View All Files ({value.length})
          </Button>
        )}
        {!Array.isArray(value) && value && renderFileCard(value, 0)}
      </Stack>

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
                  style={{ width: '100%' }}
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
          <Stack spacing={2}>{Array.isArray(value) && value.map(renderFileCard)}</Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAllDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploader;

function normalizeFileForThumbnail(file: File | FileData): string | File {
  if (file instanceof File) return file;
  if (file.url) return file.url;
  if (file.base64) return file.base64;
  return '';
}
