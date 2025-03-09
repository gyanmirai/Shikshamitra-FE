'use client';

import type { Division } from 'src/types/school';

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
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

import type { Assignment } from '../homework-creation';

interface HomeWorkCreationFormProps {
  onsubmit: (values: Assignment, status: 'draft' | 'publish') => void;
  view: string;
}

const assignmentInitialValues: Assignment = {
  title: '',
  description: '',
  class: '',
  division: [],
  subjects: [],
  submissionType: '',
  dueDate: null,
  dueTime: null,
  attachments: [],
  createdBy: '', // Would typically be auto-populated from logged-in user
  status: 'draft',
  // Optional fields
  chapters: [],
  homeworkType: '',
  isDailyTask: false,
  parentAcknowledgement: false,
  isRecurring: false,
  recurringFrequency: '',
  scheduleDate: null,
  assignmentType: '',
  evaluationCriteria: '',
  assignedResources: '',
  rubric: '',
  isScheduled: false,
};

const HomeworkAssignmentCreationForm: React.FC<HomeWorkCreationFormProps> = ({
  onsubmit,
  view,
}) => {
  const [assignmentType, setAssignmentType] = useState<'homework' | 'assignment'>('homework');
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [rubricType, setRubricType] = useState<'predefined' | 'custom'>('predefined');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik({
    initialValues: assignmentInitialValues,
    onSubmit: (values) => {
      console.log('Form Submitted:', values);
      // Implement submission logic
    },
  });

  const handleFileUpload = (files: File[]) => {
    formik.setFieldValue('attachments', files);
  };

  return (
    <Box>
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={classes}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass = classData?.items?.find((i: any) => i.id === val);
                  formik.setFieldValue('class', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Division"
                disabled={!formik.values.class}
                labelKey="name"
                valueKey="id"
                multiple
                options={divisionOptions}
                value={division}
                onChange={(val: any[]) => {
                  const selectedDivisions = divisionOptions
                    .filter((i) => val.includes(i.id))
                    .map((div) => div.name);
                  formik.setFieldValue('division', selectedDivisions);
                  setDivision(val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Subject"
                disabled={!formik.values.division}
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
              />
            </Grid>
            {view === 'homework' && (
              <Grid item xs={12} md={6}>
                <CustomSelect
                  size="small"
                  fullWidth
                  label="Chapter"
                  name="chapters"
                  multiple
                  options={[
                    { value: 'chapter1', label: 'chapter1' },
                    { value: 'chapter2', label: 'chapter2' },
                  ]}
                  value={formik.values.chapters || []}
                  onChange={(val) => formik.setFieldValue('chapter', val)}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
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
            </Grid>
            {view === 'homework' && (
              <Grid item xs={12} md={6}>
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
                />
              </Grid>
            )}
            {view === 'assignment' && (
              <Grid item xs={12} md={6}>
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
                />
              </Grid>
            )}

            <Grid item xs={12}>
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
                    />
                  </Grid>
                ) : null}
              </>
            )}

            <Grid item xs={12} md={6}>
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
                  <CustomSelect
                    label="Select Day of Submission"
                    options={[{ value: 'nextDay', label: 'NextDay' }]}
                    value={formik.values.dayOfSubmission || ''}
                    onChange={(val) => formik.setFieldValue('dayOfSubmission', val)}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
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
                </Grid>
              </>
            )}

            {!formik.values.isDailyTask && (
              <Grid item xs={12} md={6}>
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
              </Grid>
            )}

            {!formik.values.isDailyTask && (
              <Grid item xs={12} md={6}>
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
              </Grid>
            )}

            {/* Submission Type */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Submission Type</Typography>
            </Grid>
            <Grid item xs={12}>
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
        </Box>
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
  );
};

export default HomeworkAssignmentCreationForm;
