'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import { Create } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Button,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Editor } from 'src/components/editor';
import { Upload } from 'src/components/upload';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getAssignmentInitialValues } from './assignmentInitialValues';
import { assignmentValidationSchema } from './assignmentValidationSchema';
import { SectionCard } from '../../homeworkCreation/component/homeworkForm';
import AssignmentTypeForm from '../../setting/assignmentType/assignmentTypeForm';

import type { IAssignmentFormProps } from '../type';

const AssignmentForm: React.FC<IAssignmentFormProps> = ({ classes, dialog, editData, onClose }) => {
  // State to control assignment type dialog visibility
  const assignmentTypeDialog = useBoolean();

  const [allDivision, setAllDivision] = useState<Division[]>([]);
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
  }, [classes, medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
  }, [allClass, classes]);

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getAssignmentInitialValues(editData, classes),
    validationSchema: assignmentValidationSchema,
    onSubmit: (values) => {
      // Submit logic would go here
      console.log('Submitted values:', values);
    },
  });

  const handleDrop = (acceptedFiles: File[]) => {
    formik.setFieldValue('attachments', [...(formik.values.attachments || []), ...acceptedFiles]);
  };

  const handleRemove = (fileToRemove: string | File) => {
    const updatedDocuments = (formik.values.attachments || []).filter((file) => {
      if (typeof fileToRemove === 'string') {
        return file.name !== fileToRemove;
      }
      return file !== fileToRemove;
    });
    formik.setFieldValue('attachments', updatedDocuments);
  };

  // Configuration for file upload component
  const uploadProps = {
    multiple: true,
    accept: { 'application/pdf': [] },
  };

  // Handler to remove a single file attachment
  const handleRemoveFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
    setFieldValue('rubric', '');
  }, []);

  // Handler to remove all file attachments
  const handleRemoveAllFiles = useCallback((setFieldValue: (field: string, value: any) => void) => {
    setFieldValue('rubric', '');
  }, []);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '400px' }}>
            <Grid container spacing={3}>
              {/* Class Selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.class && formik.errors.class) || false}>
                  <CustomSelect
                    label="Class *"
                    options={classData?.items || []}
                    value={formik.values.class}
                    isLoading={isLoading}
                    // disabled={!!classes}
                    labelKey="name"
                    valueKey="id"
                    onChange={(val) => {
                      const selectedClass = classData?.items?.find((i: Standards) => i.id === val);
                      formik.setFieldValue('class', val);
                    }}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={!!(formik.touched.class && formik.errors.class) || false}
                    helperText={(formik.touched.class && formik.errors.class) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division Selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.division && formik.errors.division) || false}
                >
                  <CustomSelect
                    label="Division *"
                    labelKey="name"
                    valueKey="id"
                    multiple
                    options={allDivision}
                    value={formik.values.division}
                    onChange={(val) => {
                      const selectedDivisions = allDivision
                        .filter((i) => (val as string[]).includes(i.id))
                        .map((div) => div.id);
                      formik.setFieldValue('division', selectedDivisions);
                    }}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={!!(formik.touched.division && formik.errors.division) || false}
                    helperText={
                      Array.isArray(formik.errors.division)
                        ? formik.errors.division.join(', ')
                        : (formik.touched.division && formik.errors.division) || undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Subject Selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.subjects && formik.errors.subjects) || false}
                >
                  <CustomSelect
                    label="Subject *"
                    disabled={!formik.values.division || formik.values.division.length === 0}
                    options={[
                      { value: 'Mathematics', label: 'Mathematics' },
                      { value: 'Science', label: 'Science' },
                      { value: 'History', label: 'History' },
                      { value: 'English', label: 'English' },
                    ]}
                    value={formik.values.subjects}
                    onChange={(val) => formik.setFieldValue('subjects', val)}
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.subjects && formik.errors.subjects) || false}
                    helperText={(formik.touched.subjects && formik.errors.subjects) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Assignment Title */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.title && formik.errors.title) || false}>
                  <TextField
                    fullWidth
                    label="Assignment Title *"
                    // placeholder="Enter Assignment Title"
                    name="title"
                    size="small"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </ShakingTextField>
              </Grid>

              {/* Assignment Type */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.assignmentType && formik.errors.assignmentType) || false}
                >
                  <CustomSelect
                    label="Assignment Type *"
                    options={[
                      { value: 'essay', label: 'Essay' },
                      { value: 'project', label: 'Project' },
                      { value: 'quiz', label: 'Quiz' },
                      { value: 'presentation', label: 'Presentation' },
                    ]}
                    value={formik.values.assignmentType || ''}
                    onChange={(val) => formik.setFieldValue('assignmentType', val)}
                    formControlProps={{ fullWidth: true }}
                    error={
                      !!(formik.touched.assignmentType && formik.errors.assignmentType) || false
                    }
                    helperText={
                      (formik.touched.assignmentType && formik.errors.assignmentType) || ''
                    }
                  />
                </ShakingTextField>
                <Box mt={1} display="flex" justifyContent="flex-end">
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="primary.main"
                    fontSize={12}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => assignmentTypeDialog.onTrue()}
                  >
                    Add Assignment Type ?
                  </Typography>
                </Box>

                <CustomDialog
                  open={assignmentTypeDialog.value}
                  handleClose={assignmentTypeDialog.onFalse}
                  title="Add Assignment Type"
                >
                  <AssignmentTypeForm
                    open={assignmentTypeDialog}
                    onClose={assignmentTypeDialog.onFalse}
                    editData={null}
                  />
                </CustomDialog>
              </Grid>

              {/* Due Date */}
              {/* <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}
                >
                  <DateTimePicker
                    label="Due Date Time *"
                    value={formik.values.dueDate}
                    format="DD/MM/YYYY HH:mm"
                    onChange={(date) => formik.setFieldValue('dueDate', date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                        helperText:
                          formik.touched.dueDate && typeof formik.errors.dueDate === 'string'
                            ? formik.errors.dueDate
                            : undefined,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid> */}

              {/* Description */}
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description) || false}
                >
                  <Editor
                    value={formik.values.description}
                    onChange={(value) => {
                      formik.setFieldValue('description', value);
                    }}
                    placeholder="Assignment Description"
                    sx={{ width: '100%', height: '200px' }}
                  />
                </ShakingTextField>
              </Grid>

              {/* File Upload */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom color="primary.main">
                  Assignment Attachments
                </Typography>
                <Upload
                  multiple
                  value={formik.values.attachments || []}
                  onDrop={handleDrop}
                  onRemove={handleRemove}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom color="primary.main">
                  Assignment Rubric
                </Typography>{' '}
                <Upload
                  // {...uploadProps}
                  thumbnail
                  value={formik.values.rubric}
                  onDrop={(acceptedFiles) => {
                    const file = acceptedFiles[0];
                    console.log('file', file);

                    if (!file) return;

                    formik.setFieldValue('rubric', file);
                  }}
                  multiple={false}
                  onDelete={() => handleRemoveFile(formik.setFieldValue)}
                  onRemoveAll={() => handleRemoveAllFiles(formik.setFieldValue)}
                />
              </Grid>

              {/* Schedule Assignment */}
              <Grid item xs={12}>
                <SectionCard title="Schedule Assignment">
                  <Grid container spacing={2} p={2}>
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                      >
                        <DateTimePicker
                          label="Start Date Time"
                          value={dayjs(formik.values.startDate)}
                          format="DD/MM/YYYY hh:mm"
                          onChange={(date) => formik.setFieldValue('startDate', date)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: formik.touched.startDate && Boolean(formik.errors.startDate),
                              helperText:
                                formik.touched.startDate &&
                                typeof formik.errors.startDate === 'string'
                                  ? formik.errors.startDate
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                      >
                        <DateTimePicker
                          label="End Date Time"
                          value={dayjs(formik.values.endDate)}
                          format="DD/MM/YYYY hh:mm"
                          onChange={(date) => formik.setFieldValue('endDate', date)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: formik.touched.endDate && Boolean(formik.errors.endDate),
                              helperText:
                                formik.touched.endDate && typeof formik.errors.endDate === 'string'
                                  ? formik.errors.endDate
                                  : undefined,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                  </Grid>
                </SectionCard>
              </Grid>

              <Grid item xs={12}>
                <SectionCard title="Submission Type">
                  <FormControl
                    component="fieldset"
                    error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                    sx={{ p: 2 }}
                  >
                    <RadioGroup
                      row
                      name="submissionType"
                      value={formik.values.submissionType}
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel
                        value="online_text"
                        control={<Radio />}
                        label="Online Text"
                      />
                      <FormControlLabel
                        value="file_upload"
                        control={<Radio />}
                        label="File Upload"
                      />
                      <FormControlLabel
                        value="in_person"
                        control={<Radio />}
                        label="In-Person Submission"
                      />
                    </RadioGroup>
                    {formik.touched.submissionType && formik.errors.submissionType && (
                      <Typography variant="caption" color="error">
                        {formik.errors.submissionType}
                      </Typography>
                    )}
                  </FormControl>
                </SectionCard>
              </Grid>
            </Grid>
          </Scrollbar>

          {/* Action Buttons */}
          <DialogActions>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                // formik.setFieldValue('status', 1);
                formik.handleSubmit();
              }}
              startIcon={editData ? <Create /> : <Iconify icon={GlobalIcons.submit} />}
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
