'use client';

import { useState } from 'react';
import { useFormik } from 'formik';

import { Create } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
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
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  // State for managing rich text editor content
  const [editorContent, setEditorContent] = useState('');

  // Initialize formik for form handling
  const formik = useFormik<IChapterFormValues>({
    initialValues: getChapterInitialValues(initialValues),
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        startTime: values.startTime,
        endTime: values.endTime,
        timeLine: values.timeLine,
        // documents,
      });
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

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Chapter Number Input */}
              <Grid item xs={12} md={6}>
                <TextField fullWidth disabled size="small" label="Class" value={className} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth disabled size="small" label="Subject" value={subject} />
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
                    onChange={formik.handleChange}
                    size="small"
                    error={!!(formik.touched.chapterName && formik.errors.chapterName) || false}
                    helperText={formik.touched.chapterName && formik.errors.chapterName}
                  />
                </ShakingTextField>
              </Grid>
              {/* Start Time DatePicker */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.startTime && formik.errors.startTime) || false}
                >
                  <DatePicker
                    label="Chapter Start Date Time *"
                    format="DD/MM/YYYY"
                    value={formik.values.startTime}
                    onChange={(newValue) => {
                      formik.setFieldValue('startTime', newValue);
                    }}
                    sx={{ minWidth: 180, width: '100%' }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        // placeholder: 'Select Start Date',
                        helperText: formik.touched.startTime && (formik.errors.startTime as string),
                        error: formik.touched.startTime && Boolean(formik.errors.startTime),
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* End Time DatePicker */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.startTime && formik.errors.startTime) || false}
                >
                  <DatePicker
                    label="Chapter End Date Time *"
                    format="DD/MM/YYYY"
                    value={formik.values.endTime}
                    onChange={(newValue) => {
                      formik.setFieldValue('endTime', newValue);
                    }}
                    sx={{ minWidth: 180, width: '100%' }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        // placeholder: 'Select End Date',
                        error: !!(formik.touched.endTime && formik.errors.endTime) || false,
                        helperText: formik.touched.endTime && formik.errors.endTime,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Rich Text Editor for Chapter Content */}
              <Grid item xs={12} md={6}>
                <Editor
                  value={editorContent}
                  onChange={(value) => {
                    formik.setFieldValue('content', value);
                  }}
                  placeholder="Chapter Description"
                  sx={{ width: '100%' }}
                />
              </Grid>
              {/* Document Upload Section */}
              <Grid item xs={12} md={6}>
                <Upload
                  multiple
                  value={formik.values.documents}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          {/* Form Actions */}
          <DialogActions sx={{ flexShrink: 0, p: 2 }}>
            <Button
              variant="outlined"
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
              variant="contained"
            >
              {initialValues ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};
