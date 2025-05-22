'use client';

import { useState } from 'react';
import { useFormik } from 'formik';

import { Create } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  List,
  Button,
  ListItem,
  TextField,
  IconButton,
  Typography,
  ListItemText,
  DialogActions,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { validationSchema } from './validationSchema';
import { getChapterInitialValues } from './initialValues';

import type { IDocument, IChapterFormValues, IAddNewChapterProps } from './type';

// Component for adding or editing a chapter with form validation and file upload functionality
export const AddNewChapter: React.FC<IAddNewChapterProps> = ({
  onClose,
  onSubmit,
  isEdit = false,
  initialValues = null,
}: IAddNewChapterProps) => {
  // State for managing uploaded documents and their metadata
  const [documents, setDocuments] = useState<IDocument[]>(initialValues?.documents || []);
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
        documents,
      });
      onClose(null, true);
    },
  });

  // Handler for file upload
  const handleFileUpload = (files: File[]) => {
    const newDocs: IDocument[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: '',
      file,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  // Handler for removing uploaded documents
  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Chapter Number Input */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.chapterNo && formik.errors.chapterNo) || false}
                >
                  <TextField
                    fullWidth
                    label="Chapter Number *"
                    placeholder="Enter Chapter Number"
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
                    placeholder="Enter Chapter Name"
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
                    label="Chapter StartTime *"
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
                        placeholder: 'Select Start Date',
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
                    label="Chapter EndTime *"
                    format="DD/MM/YYYY"
                    value={formik.values.endTime}
                    onChange={(newValue) => {
                      formik.setFieldValue('endTime', newValue);
                    }}
                    sx={{ minWidth: 180, width: '100%' }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        placeholder: 'Select End Date',
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
                <UploadBox
                  onDrop={handleFileUpload}
                  placeholder={
                    <Box
                      sx={{
                        gap: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.disabled',
                        flexDirection: 'column',
                      }}
                    >
                      <Iconify icon="eva:cloud-upload-fill" width={40} />
                      <Typography variant="body2">Upload Material</Typography>
                    </Box>
                  }
                  sx={{
                    py: 2.5,
                    width: '100%',
                    height: '100%',
                    borderRadius: 1.5,
                  }}
                />
              </Grid>
              {/* List of Uploaded Documents */}
              {documents.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Uploaded Documents
                  </Typography>
                  <List>
                    {documents.map((doc, index) => (
                      <ListItem
                        key={doc.id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveDocument(doc.id as unknown as string)}
                          >
                            <Iconify icon="mdi:delete" />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={doc.name} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          </Scrollbar>
          {/* Form Actions */}
          <DialogActions>
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
