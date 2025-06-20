'use client';

import { useState } from 'react';
import { useFormik } from 'formik';

import { Create } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, useTheme, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import FileUploader from 'src/components/custom-upload';
import { fileData } from 'src/components/file-thumbnail';
import { shikshaMitraToast } from 'src/components/toast';
import { SingleFilePreview } from 'src/components/upload';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { validationSchema } from './validationSchema';
import { getChapterInitialValues } from './initialValues';

import type { IChapterFormValues, IAddNewChapterProps } from './type';

// Component for adding or editing a chapter with form validation and file upload functionality
export const AddNewChapter: React.FC<IAddNewChapterProps> = ({
  onClose,
  onSubmit,
  isEdit = false,
  initialValues = null,
  className,
  subject,
}: IAddNewChapterProps) => {
  // State for managing uploaded documents and their metadata
  // const [documents, setDocuments] = useState<IDocument[]>(initialValues?.documents || []);
  // State for tracking files that have been uploaded but not yet processed
  const theme = useTheme();

  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  // State for managing rich text editor content
  const [editorContent, setEditorContent] = useState('');
  const [previewFile, setPreviewFile] = useState<File | string | null>(null);
  const previewDialog = useBoolean();

  const handleView = (file: File | string) => {
    setPreviewFile(file);
    previewDialog.onTrue();
  };

  // Initialize formik for form handling
  const formik = useFormik<IChapterFormValues>({
    initialValues: getChapterInitialValues(initialValues),
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        startDate: values.startDate,
        endDate: values.endDate,
        // documents,
      });
      shikshaMitraToast.success({ message: 'Chapter added successfully !' });
      onClose(null, true);
    },
  });

  const handleDrop = (acceptedFiles: File[]) => {
    formik.setFieldValue('documents', [...(formik.values.documents || []), ...acceptedFiles]);
  };

  const handleRemove = (fileToRemove: string | File) => {
    const updatedDocuments = (formik.values.documents || []).filter((file) => {
      if (typeof fileToRemove === 'string') {
        return file.name !== fileToRemove;
      }
      return file !== fileToRemove;
    });
    formik.setFieldValue('documents', updatedDocuments);
  };

  const uploadProps = {
    multiple: true,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'video/*': [], // Added video file support
      'application/vnd.ms-powerpoint': [], // PPT
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': [], // PPTX
      'application/msword': [], // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], // DOCX
    },
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Chapter Number Input */}
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Typography variant="body2">
                    <strong>Class : </strong>
                    {className}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Subject : </strong>
                    {subject}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                >
                  <TextField
                    fullWidth
                    label="Chapter Number *"
                    // placeholder="Enter Chapter Number"
                    name="chapterNo"
                    type="number"
                    value={formik.values.chapterNo}
                    onChange={formik.handleChange}
                    size="small"
                    error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                    helperText={formik.touched.chapterNo && formik.errors.chapterNo}
                  />
                </ShakingTextField>
              </Grid>
              {/* Chapter Name Input */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                >
                  <TextField
                    fullWidth
                    label="Chapter Name  *"
                    // placeholder="Enter Chapter Name"
                    name="chapterName"
                    value={formik.values.chapterName}
                    onChange={(e) => {
                      const value = e.target.value
                        .split(' ')
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                      formik.setFieldValue('chapterName', value);
                    }}
                    size="small"
                    error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                    helperText={formik.touched.chapterName && formik.errors.chapterName}
                  />
                </ShakingTextField>
              </Grid>
              {/* Start Time DatePicker */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                >
                  <DatePicker
                    label="Chapter Start Date *"
                    format="DD/MM/YYYY"
                    value={formik.values.startDate}
                    onChange={(newValue) => {
                      formik.setFieldValue('startDate', newValue);
                    }}
                    sx={{ minWidth: 180, width: '100%' }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        // placeholder: 'Select Start Date',
                        helperText: formik.touched.startDate && (formik.errors.startDate as string),
                        error: formik.touched.startDate && Boolean(formik.errors.startDate),
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* End Time DatePicker */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                >
                  <DatePicker
                    label="Chapter End Date *"
                    format="DD/MM/YYYY"
                    value={formik.values.endDate}
                    onChange={(newValue) => {
                      formik.setFieldValue('endDate', newValue);
                    }}
                    sx={{ minWidth: 180, width: '100%' }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        // placeholder: 'Select End Date',
                        error: !!(formik.touched.endDate && formik.errors.endDate) || false,
                        helperText: formik.touched.endDate && formik.errors.endDate,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Rich Text Editor for Chapter Content */}
              <Grid item xs={12} md={6}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => {
                    formik.setFieldValue('description', value);
                  }}
                  placeholder="Description"
                  sx={{
                    border: `1px solid ${theme.palette.grey[500]}`,
                    borderRadius: 1,
                    '&:hover': {
                      borderColor: theme.palette.text.primary,
                    },
                    ...(!!formik.errors.description && {
                      borderColor: theme.palette.error.main,
                    }),
                    '&:focus-within': {
                      borderColor: theme.palette.text.primary,
                      borderWidth: 2,
                    },
                  }}
                />
              </Grid>
              {/* Document Upload Section */}
              <Grid item xs={12} md={6}>
                <FileUploader
                  // @ts-ignore
                  value={formik.values.documents}
                  multiple
                  onChange={(value) => {
                    formik.setFieldValue('documents', value);
                    // const reader = new FileReader();
                    // reader.readAsDataURL(value as File);
                    // reader.readAsDataURL(value as File);
                    // reader.onload = () => {
                    //   const base64String = reader.result;
                    // };
                  }}
                  primaryText="Please Upload Your File"
                  secondaryText="Maximum file size is 5MB"
                />
              </Grid>
            </Grid>
          </Scrollbar>

          {/* Form Actions */}

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              startIcon={initialValues ? <Create /> : <Iconify icon={GlobalIcons.submit} />}
              type="submit"
              size="small"
              variant="contained"
            >
              {initialValues ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>

          <CustomDialog
            open={previewDialog.value}
            handleClose={() => {
              setPreviewFile(null);
              previewDialog.onFalse();
            }}
            title={previewFile ? fileData(previewFile).name : ''}
            maxWidth="sm"
          >
            <Scrollbar sx={{ height: 600, maxHeight: '100%' }}>
              {previewFile && <SingleFilePreview file={previewFile} />}
            </Scrollbar>
          </CustomDialog>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};
