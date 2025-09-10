import type { UploadedFile } from 'src/screens/academic/homework-assignment-management/homeworkCreation/type';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Card, Grid, Tooltip, Typography, IconButton } from '@mui/material';

import { Iconify } from '../iconify';
import { Upload } from '../upload/upload';
import CustomDialog from '../customDialog';
import { DeleteButton } from '../upload/components/preview-single-file';

type UploadDocumentProps = {
  formik: any;
  name: string;
  title: string;
  multiple?: boolean;
  accept?: Record<string, string[]>;
};

const UploadDocument = ({
  formik,
  name,
  title = '',
  multiple = true,
  accept = { 'image/*': [], 'application/pdf': [], 'video/*': [] },
}: UploadDocumentProps) => {
  const priviewDialog = useBoolean();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        gap: 2,
        p: 2,
        boxShadow: 3,
      }}
    >
      <Box>
        <Typography variant="body1" fontWeight={600}>
          {title}
        </Typography>
        <Upload
          multiple={multiple}
          isPreview={false}
          accept={accept}
          thumbnail
          value={formik.values[name]}
          error={formik.touched[name] && formik.errors[name]}
          helperText={formik.touched[name] && formik.errors[name]}
          onDrop={async (acceptedFiles) => {
            const newFiles = await Promise.all(
              acceptedFiles.map(
                (file) =>
                  new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      resolve({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        base64: reader.result,
                      });
                    };
                  })
              )
            );

            formik.setFieldValue(name, [...(formik.values[name] || []), ...newFiles]);
          }}
          onRemove={() => {}}
          onRemoveAll={() => {}}
          sx={{
            '& svg': {
              height: '110px',
            },
            '& > div': {
              p: 2,
            },
          }}
        />
      </Box>

      {formik.values?.[name]?.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Documents :
          </Typography>
          <Grid container spacing={2}>
            {formik.values?.[name]?.map((file: UploadedFile, index: number) => {
              const isImage = file.base64?.startsWith('data:image');
              const isPDF = file.base64?.startsWith('data:application/pdf');
              const isVideo = file.base64?.startsWith('data:video');
              const fileSize = (file.size / 1024).toFixed(2);
              const fileName = file.name || `File ${index + 1}`;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: '100%',
                      position: 'relative',
                      borderRadius: 2,
                      boxShadow: 1,
                    }}
                  >
                    <Tooltip title="Remove">
                      <DeleteButton
                        onClick={() => {
                          const updatedFiles = formik.values[name].filter(
                            (_: any, i: number) => i !== index
                          );
                          formik.setFieldValue(name, updatedFiles);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          boxShadow: 1,
                          padding: '1px',
                          minWidth: 'unset',
                          width: '18px',
                          height: '18px',
                        }}
                      />
                    </Tooltip>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {isImage ? (
                        <img
                          src={file.base64}
                          alt={fileName}
                          style={{ height: 40, width: 40, objectFit: 'cover', borderRadius: 4 }}
                        />
                      ) : isPDF ? (
                        <Iconify
                          icon={GlobalIcons.pdf}
                          sx={{ width: 40, height: 40, color: '#f44336' }}
                        />
                      ) : isVideo ? (
                        <Iconify
                          icon={GlobalIcons.video}
                          sx={{ width: 40, height: 40, color: '#3f51b5' }}
                        />
                      ) : (
                        <Iconify
                          icon="mdi:file-outline"
                          sx={{ width: 40, height: 40, color: 'text.secondary' }}
                        />
                      )}

                      <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle2" noWrap sx={{ maxWidth: 140 }}>
                          {fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fileSize} KB
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setPreviewImage(file.base64);
                            priviewDialog.onTrue();
                          }}
                        >
                          <Iconify height={18} width={18} icon={GlobalIcons.eye} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      <CustomDialog
        maxWidth="md"
        open={priviewDialog.value}
        handleClose={priviewDialog.onFalse}
        title="Document Preview"
        paperProps={{ sx: { height: '80vh' } }}
      >
        <Box width="100%" height="100%">
          {previewImage?.startsWith('data:image') ? (
            <img
              src={previewImage}
              alt="Preview"
              style={{ height: '100%', width: '100%', objectFit: 'contain' }}
            />
          ) : previewImage?.startsWith('data:application/pdf') ? (
            <iframe
              src={previewImage}
              title="PDF Preview"
              style={{ height: '100%', width: '100%', border: 'none' }}
            />
          ) : previewImage?.startsWith('data:video') ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video width="100%" height="100%" controls preload="none">
              <source src={previewImage} type="video/mp4" />
              <track src="/path/to/captions.vtt" kind="subtitles" srcLang="en" label="English" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <Typography align="center" mt={4}>
              Preview not available for this file type.
            </Typography>
          )}
        </Box>
      </CustomDialog>
    </Card>
  );
};

export default UploadDocument;
