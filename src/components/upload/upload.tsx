import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import { Card } from '@mui/material';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import { UploadPlaceholder } from './components/placeholder';
import { RejectionFiles } from './components/rejection-files';
import { MultiFilePreview } from './components/preview-multi-file';
import { DeleteButton, SingleFilePreview } from './components/preview-single-file';

import type { UploadProps } from './types';

// ----------------------------------------------------------------------

export function Upload({
  sx,
  value,
  error,
  disabled,
  onDelete,
  onUpload,
  onRemove,
  thumbnail,
  helperText,
  onRemoveAll,
  multiple = false,
  isPreview = true,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections, open } =
    useDropzone({
      multiple,
      disabled,
      ...other,
    });

  const isArray = Array.isArray(value) && multiple;

  const hasFile = !isArray && !!value;

  const hasFiles = isArray && value.length > 0;
  const hasError = !!error;

  return (
    <Card sx={{ ...sx, p: 2, height: '230px', width: '100%' }}>
      {/* Upload Button */}
      {/* <Box
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          borderRadius: 1,
          border: (theme) => `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          cursor: 'pointer',
          '&:hover': { opacity: 0.72 },
          ...(hasError && {
            color: 'error.main',
            borderColor: 'error.main',
            bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          }),
        }}
      > */}
      <input {...getInputProps()} />

      {hasFile ? (
        <>
          <SingleFilePreview file={value as File} />
          <DeleteButton onClick={onDelete} />
        </>
      ) : hasFiles ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="small"
            onClick={open}
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          >
            Document
          </Button>
        </Box>
      ) : (
        <UploadPlaceholder onBrowseClick={open} />
      )}
      {/* </Box> */}

      {/* Preview List */}
      {hasFiles && (
        <Box sx={{ mt: 3 }}>
          <Scrollbar sx={{ height: 130 }}>
            <MultiFilePreview files={value} thumbnail={thumbnail} onRemove={onRemove} />
          </Scrollbar>
          {/* <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 1 }}>
            {onRemoveAll && (
              <Button variant="outlined" size="small" onClick={onRemoveAll}>
                Remove All
              </Button>
            )}
            {onUpload && (
              <Button variant="contained" size="small" onClick={onUpload}>
                Upload
              </Button>
            )}
          </Stack> */}
        </Box>
      )}

      {helperText && (
        <FormHelperText error={!!error} sx={{ px: 2 }}>
          {helperText}
        </FormHelperText>
      )}

      <RejectionFiles files={[...fileRejections]} />
    </Card>
  );
}
