import { useState } from 'react';

import { Box, Card, Grid, Tooltip, Typography, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from '../iconify';
import { Upload } from '../upload/upload';
import CustomDialog from '../customDialog';

const UploadDocument = ({ formik, name, title }: any) => {
  // Dialog state for image preview
  const priviewDialog = useBoolean();

  // State to store the currently previewed image
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
          multiple
          isPreview={false}
          accept={{ 'image/*': [], 'application/pdf': [], 'video/*': [] }}
          thumbnail
          value={formik.values[name]}
          error={formik.touched[name] && formik.errors[name]}
          helperText={formik.touched[name] && formik.errors[name]}
          onDrop={async (acceptedFiles) => {
            const base64StringArray = await Promise.all(
              acceptedFiles.map(
                async (file) =>
                  new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                      resolve(reader.result);
                    };
                  })
              )
            );
            formik.setFieldValue(name, [...formik.values[name], ...base64StringArray]);
          }}
          onRemove={(file) => {}}
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
            Documents:
          </Typography>
          <Grid container spacing={2}>
            {formik.values?.[name]?.map((file: string, index: number) => {
              const isImage = file.startsWith('data:image');
              const isPDF = file.startsWith('data:application/pdf');
              const isVideo = file.startsWith('data:video');

              // Fallback metadata
              const fileName = `File ${index + 1}`;

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {isImage ? (
                        <img
                          src={file}
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

                      <Box sx={{ ml: 2, flex: 1 }}>
                        <Typography variant="subtitle2" noWrap title={fileName}>
                          {fileName}
                        </Typography>
                      </Box>

                      <Box
                        className="document-actions"
                        sx={{
                          mt: 'auto',
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setPreviewImage(file);
                              priviewDialog.onTrue();
                            }}
                          >
                            <Iconify height={17} width={17} icon={GlobalIcons.eye} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const updatedFiles = formik.values[name].filter(
                                (_: string, i: number) => i !== index
                              );
                              formik.setFieldValue(name, updatedFiles);
                            }}
                          >
                            <Iconify
                              height={17}
                              width={17}
                              icon={GlobalIcons.delete}
                              color="error.main"
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
