'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { validationSchema } from '../validationSchema';
import { getLearningResourceInitialData } from './getLearningResourceInitialData';

import type { IResourceData, ICreateLearningResourcesProps } from '../type';
// Component for creating and editing learning resources
const CreateNewResource: React.FC<ICreateLearningResourcesProps> = ({
  data,
  onClose,
  onSave,
  isEdit,
}) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
  }, [medium]);

  // Initialize formik for form handling
  const formik = useFormik<IResourceData>({
    // Set initial form values based on edit mode and existing data
    initialValues: getLearningResourceInitialData(isEdit, data),
    validationSchema,
    // Handle form submission
    onSubmit: (values) => {
      const updatedValues = {
        ...values,
        dateUploaded: isEdit ? values.dateUploaded : new Date().toLocaleDateString(), // Only update if not in edit mode
      };
      onSave(updatedValues);
      onClose(null, true);
    },
  });

  /**
   * Handles file drop event from the upload component
   * Takes the first file from accepted files and sets it as the document value
   * @param acceptedFiles - Array of files dropped by user
   */
  const handleDrop = (acceptedFiles: File[]) => {
    formik.setFieldValue('document', acceptedFiles[0]);
  };

  /**
   * Handles file removal from the upload component
   * Clears the document value in form state
   * @param fileToRemove - File object or string to be removed (not used but required by Upload component)
   */
  const handleRemove = (fileToRemove: string | File) => {
    formik.setFieldValue('document', null);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
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
                    options={allClass}
                    value={formik.values.className}
                    onChange={(val) => formik.setFieldValue('className', val as string)}
                    label="Class *"
                    labelKey="name"
                    valueKey="name"
                    placeholder="Class"
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
                    label="Subject *"
                    options={[
                      { value: 'Math', label: 'Math' },
                      { value: 'English', label: 'English' },
                      { value: 'Science', label: 'Science' },
                    ]}
                    name="subject"
                    value={formik.values.subject}
                    onChange={(val) => formik.setFieldValue('subject', val as string)}
                    placeholder="Select Subject"
                    formControlProps={{ sx: { minWidth: 275, width: '100%' } }}
                    error={!!(formik.touched.subject && formik.errors.subject) || false}
                    helperText={(formik.touched.subject && formik.errors.subject) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.chapter && formik.errors.chapter) || false}
                >
                  <CustomSelect
                    label="Chapter"
                    options={[
                      { value: 'chapter1', label: 'Chapter 1' },
                      { value: 'chapter2', label: 'Chapter 2' },
                      { value: 'chapter3', label: 'Chapter 3' },
                      { value: 'chapter4', label: 'Chapter 4' },
                      { value: 'chapter5', label: 'Chapter 5' },
                    ]}
                    disabled={!formik.values.chapter}
                    name="chapter"
                    value={formik.values.chapter || ''}
                    onChange={(val) => formik.setFieldValue('chapter', val as string)}
                    placeholder="Select chapter"
                    formControlProps={{ sx: { minWidth: 275, width: '100%' } }}
                    error={!!(formik.touched.chapter && formik.errors.chapter) || false}
                    helperText={(formik.touched.chapter && formik.errors.chapter) || ''}
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
                    label="Resource Title *"
                    placeholder="Enter Resource Title"
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

              {/* File upload box */}
              <Grid item xs={12}>
                <Upload
                  multiple={false}
                  thumbnail
                  value={formik.values.document}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                  sx={{}}
                />
              </Grid>
            </Grid>
          </Scrollbar>
          {/* Action buttons */}
          <DialogActions>
            <Button
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} />}
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default CreateNewResource;
