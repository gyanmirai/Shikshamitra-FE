'use client';

import type { Division, Standards } from 'src/types/school';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Button,
  Switch,
  Checkbox,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { AddCategory } from '../../setting/setting';
import { getValidationSchema } from './validationSchema';
import { assignmentInitialValues } from './assignmentInitialValues';

import type { IHomeWorkCreationFormProps } from '../type';

const HomeworkAssignmentCreationForm: React.FC<IHomeWorkCreationFormProps> = ({
  onsubmit,
  view,
}) => {
  const homeworkTypeDialog = useBoolean();
  const assignmentTypeDialog = useBoolean();
  // State to manage assignment type (homework/assignment)
  const [assignmentType, setAssignmentType] = useState<'homework' | 'assignment'>('homework');
  // State to store selected class ID
  const [classes, setClasses] = useState<string>('');
  // State to store selected division IDs
  const [division, setDivision] = useState<string[]>([]);
  // State to store available division options for selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  // State to manage rubric type (predefined/custom)
  const [rubricType, setRubricType] = useState<'predefined' | 'custom'>('predefined');

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: assignmentInitialValues,
    validationSchema: getValidationSchema(view),
    onSubmit: (values) => {
      // Implement submission logic
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} sx={{ height: '100%' }}>
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!(formik.touched.class && formik.errors.class) || false}>
                <CustomSelect
                  label="Class"
                  options={classData?.items || []}
                  value={classes}
                  isLoading={isLoading}
                  labelKey="name"
                  valueKey="id"
                  onChange={(val) => {
                    const selectedClass = classData?.items?.find((i: Standards) => i.id === val);
                    formik.setFieldValue('class', selectedClass?.name || '');
                    setClasses(val as string);
                    setDivisionOptions(selectedClass?.divisions || []);
                  }}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  error={!!(formik.touched.class && formik.errors.class) || false}
                  helperText={(formik.touched.class && formik.errors.class) || ''}
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.division && formik.errors.division) || false}
              >
                <CustomSelect
                  label="Division"
                  disabled={!formik.values.class}
                  labelKey="name"
                  valueKey="id"
                  multiple
                  options={divisionOptions}
                  value={division}
                  onChange={(val) => {
                    const selectedDivisions = divisionOptions
                      .filter((i) => (val as string[]).includes(i.id))
                      .map((div) => div.name);
                    formik.setFieldValue('division', selectedDivisions);
                    setDivision(val as string[]);
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

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.subjects && formik.errors.subjects) || false}
              >
                <CustomSelect
                  label="Subject"
                  disabled={!formik.values.division || formik.values.division.length === 0}
                  options={[
                    { value: 'math', label: 'Mathematics' },
                    { value: 'science', label: 'Science' },
                    { value: 'history', label: 'History' },
                    { value: 'english', label: 'English' },
                  ]}
                  multiple
                  value={formik.values.subjects}
                  onChange={(val) => formik.setFieldValue('subjects', val)}
                  formControlProps={{ fullWidth: true }}
                  error={!!(formik.touched.subjects && formik.errors.subjects) || false}
                  helperText={
                    Array.isArray(formik.errors.subjects)
                      ? formik.errors.subjects.join(', ')
                      : (formik.touched.subjects && formik.errors.subjects) || undefined
                  }
                />
              </ShakingTextField>
            </Grid>
            {view === 'homework' && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.chapters && formik.errors.chapters) || false}
                >
                  <CustomSelect
                    size="small"
                    fullWidth
                    disabled={!formik.values.subjects || formik.values.subjects.length === 0}
                    label="Chapter"
                    name="chapters"
                    multiple
                    options={[
                      { value: 'chapter1', label: 'chapter1' },
                      { value: 'chapter2', label: 'chapter2' },
                    ]}
                    value={formik.values.chapters || []}
                    onChange={(val) => formik.setFieldValue('chapter', val)}
                    error={!!(formik.touched.chapters && formik.errors.chapters) || false}
                    helperText={
                      Array.isArray(formik.errors.chapters)
                        ? formik.errors.chapters.join(', ')
                        : (formik.touched.chapters && formik.errors.chapters) || undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <ShakingTextField error={!!(formik.touched.title && formik.errors.title) || false}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  size="small"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </ShakingTextField>
            </Grid>
            {view === 'homework' && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.homeworkType && formik.errors.homeworkType) || false}
                >
                  <CustomSelect
                    label="Homework Type"
                    options={[
                      { value: 'practice', label: 'Practice Questions' },
                      { value: 'reading', label: 'Reading Material' },
                      { value: 'revision', label: 'Revision' },
                    ]}
                    value={formik.values.homeworkType || ''}
                    onChange={(val) => formik.setFieldValue('homeworkType', val)}
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.homeworkType && formik.errors.homeworkType) || false}
                    helperText={(formik.touched.homeworkType && formik.errors.homeworkType) || ''}
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
                    homeworkTypeDialog.onTrue();
                  }}
                >
                  Add Homework Type ?
                </Typography>

                <CustomDialog
                  open={homeworkTypeDialog.value}
                  handleClose={homeworkTypeDialog.onFalse}
                  title="Homework Type"
                >
                  <AddCategory
                    onClose={homeworkTypeDialog.onFalse}
                    data={null}
                    onSubmit={() => {}}
                    isEdit={false}
                  />
                </CustomDialog>
              </Grid>
            )}
            {view === 'assignment' && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.assignmentType && formik.errors.assignmentType) || false}
                >
                  <CustomSelect
                    label="Assignment Type"
                    options={[
                      { value: 'research', label: 'Research-Based' },
                      { value: 'practical', label: 'Practical' },
                      { value: 'group_work', label: 'Group Work' },
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
                  title="Assignment Type"
                >
                  <AddCategory
                    onClose={assignmentTypeDialog.onFalse}
                    data={null}
                    onSubmit={() => {}}
                    isEdit={false}
                  />
                </CustomDialog>
              </Grid>
            )}

            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched.description && formik.errors.description) || false}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </ShakingTextField>
            </Grid>

            {view === 'assignment' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Rubric Selection
                  </Typography>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.rubricRequired}
                        onChange={(e) => formik.setFieldValue('rubricRequired', e.target.checked)}
                      />
                    }
                    label="Rubric Required"
                  />
                  {formik.values.rubricRequired && (
                    <RadioGroup
                      row
                      value={rubricType}
                      onChange={(e) => setRubricType(e.target.value as 'predefined' | 'custom')}
                    >
                      <FormControlLabel
                        value="predefined"
                        control={<Radio />}
                        label="Predefined Rubric"
                      />
                      <FormControlLabel value="custom" control={<Radio />} label="Custom Rubric" />
                    </RadioGroup>
                  )}
                </Grid>
                {rubricType === 'predefined' && formik.values.rubricRequired ? (
                  <Grid item xs={12}>
                    <UploadBox
                      onDrop={(acceptedFiles) => {
                        formik.setFieldValue('rubricAttachment', acceptedFiles);
                      }}
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
                          <Typography variant="body2">Upload Rubric Document</Typography>
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
                ) : formik.values.rubricRequired ? (
                  <Grid item xs={12}>
                    <ShakingTextField
                      error={!!(formik.touched.rubric && formik.errors.rubric) || false}
                    >
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Custom Rubric"
                        name="rubric"
                        value={formik.values.rubric}
                        onChange={formik.handleChange}
                        placeholder="Enter your custom rubric details here..."
                        variant="outlined"
                        error={formik.touched.rubric && Boolean(formik.errors.rubric)}
                        helperText={formik.touched.rubric && formik.errors.rubric}
                      />
                    </ShakingTextField>
                  </Grid>
                ) : null}
              </>
            )}

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={!!(formik.touched.todaysDate && formik.errors.todaysDate) || false}
              >
                <DatePicker
                  label="Today's Date"
                  value={formik.values.todaysDate}
                  onChange={(date) => formik.setFieldValue('todaysDate', date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.todaysDate && Boolean(formik.errors.todaysDate),
                      helperText: formik.touched.todaysDate && formik.errors.todaysDate,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>

            {/* Homework-Specific Fields */}

            {/* Assignment-Specific Fields */}

            {/* Submission Details */}
            {view === 'homework' && (
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.isDailyTask}
                      onChange={(e) => formik.setFieldValue('isDailyTask', e.target.checked)}
                    />
                  }
                  label="Daily Task"
                />
              </Grid>
            )}

            {formik.values.isDailyTask && (
              <>
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={
                      !!(formik.touched.dayOfSubmission && formik.errors.dayOfSubmission) || false
                    }
                  >
                    <CustomSelect
                      label="Select Day of Submission"
                      options={[{ value: 'nextDay', label: 'NextDay' }]}
                      value={formik.values.dayOfSubmission || ''}
                      onChange={(val) => formik.setFieldValue('dayOfSubmission', val)}
                      formControlProps={{ fullWidth: true }}
                      error={
                        formik.touched.dayOfSubmission && Boolean(formik.errors.dayOfSubmission)
                      }
                      helperText={
                        formik.touched.dayOfSubmission && formik.errors.dayOfSubmission
                          ? formik.errors.dayOfSubmission
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                  >
                    <DatePicker
                      name="endDate"
                      label="Select End Date"
                      value={formik.values.endDate}
                      onChange={(date) => formik.setFieldValue('endDate', date)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          error: formik.touched.endDate && Boolean(formik.errors.endDate),
                          helperText: formik.touched.endDate && formik.errors.endDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </>
            )}

            {!formik.values.isDailyTask && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}
                >
                  <DatePicker
                    label="Due Date"
                    value={formik.values.dueDate}
                    onChange={(date) => formik.setFieldValue('dueDate', date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                        helperText: formik.touched.dueDate && formik.errors.dueDate,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {!formik.values.isDailyTask && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.dueTime && formik.errors.dueTime) || false}
                >
                  <TimePicker
                    label="Due Time"
                    value={formik.values.dueTime}
                    onChange={(time) => formik.setFieldValue('dueTime', time)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.dueTime && Boolean(formik.errors.dueTime),
                        helperText: formik.touched.dueTime && formik.errors.dueTime,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isScheduled}
                    onChange={(e) => {
                      formik.setFieldValue('isScheduled', e.target.checked);
                    }}
                  />
                }
                label={view === 'homework' ? 'Schedule Homework' : 'Schedule Assignment'}
              />
            </Grid>

            {formik.values.isScheduled && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.scheduleDate && formik.errors.scheduleDate) || false}
                >
                  <DatePicker
                    label="Schedule Date"
                    value={formik.values.scheduleDate}
                    onChange={(date) => formik.setFieldValue('scheduleDate', date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.scheduleDate && Boolean(formik.errors.scheduleDate),
                        helperText: formik.touched.scheduleDate && formik.errors.scheduleDate,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {/* Submission Type */}
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

            {/* File Upload */}
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
          </Grid>
        </Scrollbar>

        {/* Action Buttons */}
        <DialogActions>
          <Button
            variant="contained"
            color="warning"
            onClick={() => formik.setFieldValue('status', 'draft')}
          >
            Save Draft
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={() => formik.setFieldValue('status', 'published')}
          >
            Publish
          </Button>
        </DialogActions>
      </Box>
    </form>
  );
};

export default HomeworkAssignmentCreationForm;
