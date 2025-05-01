'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import { MuiColorInput } from 'mui-color-input';

import {
  Box,
  List,
  Grid,
  Button,
  ListItem,
  TextField,
  IconButton,
  Typography,
  ListItemText,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { validationSchema } from './validationSchema';
import { getSubjectInitialValues } from './initialValues';
import SettingSubjectForm from '../../setting/subjectCreation/subjectForm';

import type { IDocument, ISubjectFormProps, ISubjectFormValues } from './type';

const SubjectForm = ({ onSubmit, onClose, data, isEdit }: ISubjectFormProps) => {
  // State to track if the form is in draft mode - determined by edit status or existing data status
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));
  // State to manage uploaded documents with initial value from existing data or empty array
  const [documents, setDocuments] = useState<IDocument[]>(data?.documents || []);
  // Flag to check if the subject is already published
  const isPublished = data?.status === 'Publish';
  const addSubjectDialog = useBoolean();
  // Initialize formik form with initial values from data prop or default values
  const formik = useFormik<ISubjectFormValues>({
    initialValues: getSubjectInitialValues(data),
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now(),
        documents,
      });
      onClose(null, true);
    },
  });
  console.log('formik initial values----', formik.errors);

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Handle file upload and create document objects with unique IDs
  const handleFileUpload = (files: File[]) => {
    const newDocs: IDocument[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  // Remove document from the documents array by ID
  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  // Add this function to your component
  const handlePublish = async () => {
    // Update the status
    await formik.setFieldValue('status', 'Publish', false);

    // Mark the primary teacher field as touched to show validation errors
    await formik.setFieldTouched('primaryTeacher', true, false);

    // Now validate just the primary teacher field with the updated status
    await formik.validateField('primaryTeacher');

    // Check if the field is valid
    if (!formik.errors.primaryTeacher) {
      formik.handleSubmit();
    }
  };
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.className && formik.errors.className) || false}
                >
                  <CustomSelect
                    options={classData?.items || []}
                    label="Class"
                    isLoading={isLoading}
                    value={formik.values.className}
                    labelKey="name"
                    valueKey="name"
                    onChange={(val) => {
                      formik.setFieldValue('className', val);
                    }}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    error={formik.touched.className && Boolean(formik.errors.className)}
                    helperText={(formik.touched.className && formik.errors.className) || ''}
                    disabled={isPublished}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.subjectCode && formik.errors.subjectCode) || false}
                >
                  <TextField
                    fullWidth
                    label="Subject Code"
                    name="subjectCode"
                    size="small"
                    value={formik.values.subjectCode}
                    onChange={formik.handleChange}
                    disabled={isPublished}
                    error={formik.touched.subjectCode && Boolean(formik.errors.subjectCode)}
                    helperText={formik.touched.subjectCode && formik.errors.subjectCode}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.subjectName && formik.errors.subjectName) || false}
                >
                  <CustomSelect
                    options={[{ value: 'Math', label: 'Math' }]}
                    label="Subject Name"
                    isLoading={isLoading}
                    value={formik.values.subjectName}
                    onChange={(val) => {
                      formik.setFieldValue('subjectName', val);
                    }}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                    helperText={(formik.touched.subjectName && formik.errors.subjectName) || ''}
                    disabled={isPublished}
                  />{' '}
                </ShakingTextField>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  textAlign="right"
                  color="primary.main"
                  fontSize={12}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    addSubjectDialog.onTrue();
                  }}
                >
                  Add Subject ?
                </Typography>
                <CustomDialog
                  open={addSubjectDialog.value}
                  handleClose={addSubjectDialog.onFalse}
                  title="Add Subject"
                >
                  <SettingSubjectForm
                    open={addSubjectDialog}
                    onClose={() => {
                      addSubjectDialog.onFalse();
                    }}
                    editData={null}
                  />{' '}
                </CustomDialog>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.subjectColor && formik.errors.subjectColor) || false}
                >
                  <MuiColorInput
                    placeholder="Subject Color"
                    size="small"
                    format="hex"
                    value={formik.values.subjectColor}
                    onChange={(e) => {
                      formik.setFieldValue('subjectColor', e);
                    }}
                    disabled={!formik.values.subjectName}
                    sx={{
                      minWidth: 180,
                      width: '100%',
                      '& .MuiInputBase-root': {
                        fontSize: '0.875rem',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        fontSize: '0.875rem',
                      },
                    }}
                    error={formik.touched.subjectColor && Boolean(formik.errors.subjectColor)}
                    helperText={formik.touched.subjectColor && formik.errors.subjectColor}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.primaryTeacher && formik.errors.primaryTeacher) || false}
                >
                  <CustomSelect
                    label="Primary Teacher"
                    options={[
                      { value: 'Jiya', label: 'Jiya' },
                      { value: 'Riya', label: 'Riya' },
                      { value: 'Priya', label: 'Priya' },
                    ]}
                    name="primaryTeacher"
                    value={formik.values.primaryTeacher}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    onChange={(val) => {
                      formik.setFieldValue('primaryTeacher', val);
                    }}
                    error={formik.touched.primaryTeacher && Boolean(formik.errors.primaryTeacher)}
                    helperText={
                      (formik.touched.primaryTeacher && formik.errors.primaryTeacher) || ''
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={
                    !!(formik.touched.secondaryTeacher && formik.errors.secondaryTeacher) || false
                  }
                >
                  <CustomSelect
                    label="Secondary Teacher"
                    options={[
                      { value: 'Jiya', label: 'Jiya' },
                      { value: 'Riya', label: 'Riya' },
                      { value: 'Priya', label: 'Priya' },
                    ]}
                    name="secondaryTeacher"
                    multiple
                    value={formik.values.secondaryTeacher}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    onChange={(val) => {
                      formik.setFieldValue('secondaryTeacher', val);
                    }}
                    error={
                      formik.touched.secondaryTeacher && Boolean(formik.errors.secondaryTeacher)
                    }
                    helperText={
                      formik.touched.secondaryTeacher && formik.errors.secondaryTeacher
                        ? Array.isArray(formik.errors.secondaryTeacher)
                          ? formik.errors.secondaryTeacher.join(', ')
                          : formik.errors.secondaryTeacher
                        : ''
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.learningGoal && formik.errors.learningGoal) || false}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    disabled={isPublished}
                    label="Learning Goals"
                    name="learningGoal"
                    onChange={formik.handleChange}
                    value={formik.values.learningGoal}
                    size="small"
                    error={formik.touched.learningGoal && Boolean(formik.errors.learningGoal)}
                    helperText={formik.touched.learningGoal && formik.errors.learningGoal}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.prerequisites && formik.errors.prerequisites) || false}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    disabled={isPublished}
                    label="Prerequisites or Resources"
                    name="prerequisites"
                    size="small"
                    value={formik.values.prerequisites}
                    onChange={formik.handleChange}
                    error={formik.touched.prerequisites && Boolean(formik.errors.prerequisites)}
                    helperText={formik.touched.prerequisites && formik.errors.prerequisites}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description) || false}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    disabled={isPublished}
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
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
                      <Typography variant="body2">Upload Document</Typography>
                    </Box>
                  }
                  sx={{
                    py: 2.5,
                    width: '100%',
                    height: 'auto',
                    borderRadius: 1.5,
                  }}
                />
              </Grid>
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
          <DialogActions sx={{ flexShrink: 0, p: 2 }}>
            {isEdit ? (
              <Button
                variant="contained"
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Update
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
                  onClick={() => {
                    formik.setFieldValue('status', 'UnPublish');
                    formik.handleSubmit();
                  }}
                >
                  Save Draft
                </Button>
                <Button
                  startIcon={<Iconify icon={GlobalIcons.publish} />}
                  type="submit"
                  variant="contained"
                  onClick={handlePublish}
                >
                  Publish
                </Button>
              </>
            )}
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default SubjectForm;
