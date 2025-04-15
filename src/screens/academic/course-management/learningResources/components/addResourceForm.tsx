'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { validationSchema } from '../validationSchema';
import { getLearningResourceInitialData } from './getLearningResourceInitialData';
import LearningResourceTypeForm from '../../settings/components/learningResourceForm';

import type { IResourceData, ICreateLearningResourcesProps } from '../type';
// Component for creating and editing learning resources
const CreateNewResource: React.FC<ICreateLearningResourcesProps> = ({
  data,
  onClose,
  onSave,
  isEdit,
  currentClass,
  currentSubject,
}) => {
  // State for managing messages and draft status
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'draft'));

  // Fetch class data using custom hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const resourceDialog = useBoolean();

  // Initialize formik for form handling
  const formik = useFormik<IResourceData>({
    // Set initial form values based on edit mode and existing data
    initialValues: getLearningResourceInitialData(isEdit, currentClass, currentSubject, data),
    validationSchema,
    // Handle form submission
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        status: isDraft ? 'Unpublish' : 'Publish',
        dateUploaded: isEdit ? values.dateUploaded : new Date().toLocaleDateString(), // Only update if not in edit mode
      };
      onSave(updatedValues);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        {/* Scrollable container for form fields */}
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={3}>
            {/* Class selection dropdown */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.className && formik.errors.className) || false}
              >
                <CustomSelect
                  options={classData?.items || []}
                  value={formik.values.className}
                  onChange={(val) => formik.setFieldValue('className', val as string)}
                  label="Class"
                  isLoading={isLoading}
                  labelKey="name"
                  valueKey="name"
                  formControlProps={{ sx: { minWidth: 270, width: '100%' } }}
                  error={!!(formik.touched.className && formik.errors.className) || false}
                  helperText={(formik.touched.className && formik.errors.className) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* Subject selection dropdown */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.subject && formik.errors.subject) || false}
              >
                <CustomSelect
                  label="Subject"
                  options={[
                    { value: 'Math', label: 'Math' },
                    { value: 'English', label: 'English' },
                    { value: 'Science', label: 'Science' },
                  ]}
                  name="subject"
                  value={formik.values.subject}
                  onChange={(val) => formik.setFieldValue('subject', val as string)}
                  formControlProps={{ sx: { minWidth: 275, width: '100%' } }}
                  error={!!(formik.touched.subject && formik.errors.subject) || false}
                  helperText={(formik.touched.subject && formik.errors.subject) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* Resource title input */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.resourceTitle && formik.errors.resourceTitle) || false}
              >
                <TextField
                  disabled={isEdit}
                  label="Resource Title"
                  size="small"
                  name="resourceTitle"
                  value={formik.values.resourceTitle}
                  onChange={formik.handleChange}
                  fullWidth
                  error={!!(formik.touched.resourceTitle && formik.errors.resourceTitle) || false}
                  helperText={(formik.touched.resourceTitle && formik.errors.resourceTitle) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* Resource type selection */}
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.typeOfResource && formik.errors.typeOfResource) || false}
              >
                <CustomSelect
                  label="Select Resource Type"
                  options={[
                    { value: 'video', label: 'Video' },
                    { value: 'audio', label: 'Audio' },
                    { value: 'document', label: 'Document' },
                  ]}
                  value={formik.values.typeOfResource}
                  onChange={(val) => {
                    formik.setFieldValue('typeOfResource', val as string);
                  }}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  error={!!(formik.touched.typeOfResource && formik.errors.typeOfResource) || false}
                  helperText={(formik.touched.typeOfResource && formik.errors.typeOfResource) || ''}
                />
              </ShakingTextField>
              <Typography
                variant="body2"
                fontWeight={500}
                textAlign="right"
                color="primary.main"
                fontSize={12}
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  resourceDialog.onTrue();
                }}
              >
                Add Resource Type
              </Typography>
              <CustomDialog
                open={resourceDialog.value}
                handleClose={() => {
                  resourceDialog.onFalse();
                }}
                title="Add Learning Resource"
              >
                <LearningResourceTypeForm
                  data={null}
                  onClose={resourceDialog.onFalse}
                  isEdit={false}
                />
              </CustomDialog>
            </Grid>
            {/* Description text area */}
            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.description && formik.errors.description) || false}
              >
                <TextField
                  label="Description"
                  size="small"
                  multiline
                  rows={4}
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  fullWidth
                  error={!!(formik.touched.description && formik.errors.description) || false}
                  helperText={(formik.touched.description && formik.errors.description) || ''}
                />
              </ShakingTextField>
            </Grid>
            {/* File upload box */}
            <Grid item xs={12}>
              <UploadBox
                onDrop={() => {}}
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
                    <Typography variant="body2">Drag Your Document</Typography>
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
          </Grid>
        </Scrollbar>
        {/* Action buttons */}
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsDraft(true);
              formik.handleSubmit();
            }}
            color="warning"
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={() => {
              setIsDraft(false);
              formik.handleSubmit();
            }}
          >
            Save and Publish
          </Button>
        </DialogActions>
      </Box>
    </form>
  );
};

export default CreateNewResource;
