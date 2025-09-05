import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useDropzone } from 'react-dropzone';
import { useBoolean } from 'src/hooks/use-boolean';
import FormHelperText from '@mui/material/FormHelperText';
import { Card, IconButton, ListItemText } from '@mui/material';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import { fileData, FileThumbnail } from '../file-thumbnail';
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
  onView,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections, open } =
    useDropzone({
      multiple,
      disabled,
      ...other,
    });

  const isArray = Array.isArray(value) && multiple;
  const [visibleCount, setVisibleCount] = useState(2);

  const hasFile = !isArray && !!value;
  const dialog = useBoolean();

  const hasFiles = isArray && value.length > 0;
  const hasError = !!error;
  const remainingFiles = value?.slice(visibleCount);

  return (
    <Card sx={{ ...sx, p: 2, height: '240px', width: '100%', boxShadow: 3 }}>
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

      {/* </Box> */}

      {hasFile ? (
        <>
          <SingleFilePreview file={value as File} />
          <DeleteButton onClick={onDelete} />
        </>
      ) : hasFiles ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={open}
            startIcon={<Iconify icon="eva:cloud-upload-fill" />}
          >
            Document
          </Button>

          <Button
            size="small"
            disabled={value.length <= 2}
            onClick={dialog.onTrue}
            endIcon={<Iconify icon="weui:arrow-outlined" />}
          >
            View all
          </Button>
        </Box>
      ) : (
        <UploadPlaceholder onBrowseClick={open} />
      )}
      {/* Preview List */}
      {hasFiles && (
        <Scrollbar sx={{ height: 180 }}>
          <MultiFilePreview
            files={value}
            thumbnail={thumbnail}
            onRemove={onRemove}
            onView={onView}
          />
        </Scrollbar>
      )}

      {/* {helperText && shikshaMitraToast.error({ message: helperText })} */}
      {helperText && (
        <FormHelperText error sx={{ mt: 1 }}>
          {helperText}
        </FormHelperText>
      )}
      <RejectionFiles files={[...fileRejections]} />
      <CustomDialog
        title="Remaining Files"
        open={dialog.value}
        handleClose={dialog.onFalse}
        maxWidth="sm"
        fullWidth
      >
        <ShowMoreDocuments
          dialog={dialog}
          remainingFiles={remainingFiles}
          onView={onView}
          onRemove={onRemove}
        />
      </CustomDialog>
    </Card>
  );
}

const ShowMoreDocuments = ({
  dialog,
  remainingFiles,
  onView,
  onRemove,
}: {
  dialog: UseBooleanReturn;
  remainingFiles: any;
  onView: ((file: File | string) => void) | undefined;
  onRemove: ((file: string | File) => void) | undefined;
}) => (
  <Scrollbar sx={{ maxHeight: 400 }}>
    <Box sx={{ p: 3 }}>
      {remainingFiles?.map((file: any) => {
        const { name } = fileData(file);
        return (
          <Box
            key={name}
            sx={{
              border: 1,
              borderColor: 'grey.300',
              p: 2,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 2,
              gap: 1,
            }}
          >
            <FileThumbnail
              file={file}
              // {...slotProps?.thumbnail}
              sx={{ height: '25px', width: '25px' }}
            />

            <ListItemText
              primaryTypographyProps={{ variant: 'body2' }}
              primary={name}
              sx={{ flex: 1, ml: 2 }}
            />
            <Box sx={{ display: 'flex' }}>
              <IconButton size="small" onClick={() => onView?.(file)}>
                <Iconify icon="mdi:eye" width={16} height={16} />
              </IconButton>

              {onRemove && (
                <IconButton
                  size="small"
                  onClick={() => {
                    onRemove(file);
                    // Close dialog if this is the last remaining file
                    if (remainingFiles.length === 1) {
                      dialog.onFalse();
                    }
                  }}
                >
                  <Iconify icon="mingcute:close-line" width={16} height={16} />
                </IconButton>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  </Scrollbar>
);
