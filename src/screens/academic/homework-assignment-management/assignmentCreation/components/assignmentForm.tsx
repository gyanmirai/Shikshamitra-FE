'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Create } from '@mui/icons-material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Radio,
  Button,
  Switch,
  TextField,
  CardHeader,
  RadioGroup,
  Typography,
  CardContent,
  FormControl,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import UploadDocument from 'src/components/upload-document/uploadDocument';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getAssignmentInitialValues } from './assignmentInitialValues';
import { assignmentValidationSchema } from './assignmentValidationSchema';
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

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '600px' }}>
            <Grid container spacing={3}>
              {/* Class Selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.class && formik.errors.class) || false}>
                  <CustomSelect
                    label="Class *"
                    options={classData?.items || []}
                    value={classes}
                    isLoading={isLoading}
                    disabled={!!classes}
                    labelKey="name"
                    valueKey="id"
                    onChange={(val) => {
                      const selectedClass = classData?.items?.find((i: Standards) => i.id === val);
                      formik.setFieldValue('class', selectedClass?.name || '');
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
                      { value: 'math', label: 'Mathematics' },
                      { value: 'science', label: 'Science' },
                      { value: 'history', label: 'History' },
                      { value: 'english', label: 'English' },
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
                    placeholder="Enter Assignment Title"
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
                <Typography
                  variant="body2"
                  fontWeight={500}
                  textAlign="right"
                  color="primary.main"
                  fontSize={12}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    assignmentTypeDialog.onTrue();
                  }}
                >
                  Add Assignment Type ?
                </Typography>

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
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}
                >
                  <DateTimePicker
                    label="Due Date *"
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
              </Grid>

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
                    sx={{ width: '100%' }}
                  />
                </ShakingTextField>
              </Grid>

              {/* File Upload */}
              <Grid item xs={12}>
                <UploadDocument formik={formik} name="attachments" title="Upload Attachment" />
              </Grid>

              {/* Schedule Assignment */}
              <Grid item xs={12}>
                <Card sx={{ boxShadow: 3 }}>
                  <CardHeader title="Schedule Assignment" />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formik.values.isScheduled}
                              onChange={(e) =>
                                formik.setFieldValue('isScheduled', e.target.checked)
                              }
                            />
                          }
                          label="Enable Schedule"
                        />
                      </Grid>

                      {/* Conditional Schedule Date field */}
                      {formik.values.isScheduled && (
                        <Grid item xs={12} md={6}>
                          <ShakingTextField
                            error={
                              !!(formik.touched.scheduleDate && formik.errors.scheduleDate) || false
                            }
                          >
                            <DatePicker
                              label="Schedule Date"
                              value={dayjs(formik.values.scheduleDate)}
                              format="DD/MM/YYYY"
                              onChange={(date) => formik.setFieldValue('scheduleDate', date)}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  error:
                                    formik.touched.scheduleDate &&
                                    Boolean(formik.errors.scheduleDate),
                                  helperText:
                                    formik.touched.scheduleDate &&
                                    typeof formik.errors.scheduleDate === 'string'
                                      ? formik.errors.scheduleDate
                                      : undefined,
                                },
                              }}
                            />
                          </ShakingTextField>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                >
                  <Typography variant="subtitle2">Submission Type</Typography>
                  <RadioGroup
                    row
                    name="submissionType"
                    value={formik.values.submissionType}
                    onChange={formik.handleChange}
                  >
                    <FormControlLabel value="online_text" control={<Radio />} label="Online Text" />
                    <FormControlLabel value="file_upload" control={<Radio />} label="File Upload" />
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
              </Grid>
            </Grid>
          </Scrollbar>

          {/* Action Buttons */}
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                if (editData) {
                  onClose(null, false);
                } else {
                  formik.setFieldValue('status', 'draft');
                  formik.handleSubmit();
                }
              }}
              startIcon={
                editData ? (
                  <Iconify icon={GlobalIcons.cancel} />
                ) : (
                  <Iconify icon={GlobalIcons.draftIcon} />
                )
              }
            >
              {editData ? 'Cancel' : 'Save Draft'}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                formik.setFieldValue('status', 'publish');
                formik.handleSubmit();
              }}
              startIcon={editData ? <Create /> : <Iconify icon={GlobalIcons.publish} />}
            >
              {editData ? 'Update' : 'Publish'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
