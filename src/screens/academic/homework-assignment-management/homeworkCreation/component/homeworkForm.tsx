'use client';

import type { Division, Standards } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Create } from '@mui/icons-material';
import { DatePicker, DateTimePicker } from '@mui/x-date-pickers';
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

import { getHomeworkInitialValues } from './homeworkInitialValues';
import { homeworkValidationSchema } from './homeworkValidationSchema';
import { AddCategory } from '../../setting/addHomworkAssessmentTypeForm';

import type { IHomeWorkCreationFormProps } from '../type';

const HomeworkForm: React.FC<IHomeWorkCreationFormProps> = ({ dialog, editData, onClose }) => {
  // State to control homework type dialog visibility
  const homeworkTypeDialog = useBoolean();

  // State to store selected class ID
  const [classes, setClasses] = useState<string>('');
  // State to store selected division IDs
  const [division, setDivision] = useState<string[]>([]);
  // State to store available division options for selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getHomeworkInitialValues(editData),
    validationSchema: homeworkValidationSchema,
    onSubmit: (values) => {},
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

              {/* Division Selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.division && formik.errors.division) || false}
                >
                  <CustomSelect
                    label="Division *"
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

              {/* Chapter Selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.chapters && formik.errors.chapters) || false}
                >
                  <CustomSelect
                    size="small"
                    fullWidth
                    disabled={!formik.values.subjects || formik.values.subjects.length === 0}
                    label="Chapter *"
                    name="chapters"
                    multiple
                    options={[
                      { value: 'chapter1', label: 'chapter1' },
                      { value: 'chapter2', label: 'chapter2' },
                    ]}
                    value={formik.values.chapters || []}
                    onChange={(val) => formik.setFieldValue('chapters', val)}
                    error={!!(formik.touched.chapters && formik.errors.chapters) || false}
                    helperText={
                      Array.isArray(formik.errors.chapters)
                        ? formik.errors.chapters.join(', ')
                        : (formik.touched.chapters && formik.errors.chapters) || undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Homework Title */}
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.title && formik.errors.title) || false}>
                  <TextField
                    fullWidth
                    label="Homework Title *"
                    placeholder="Enter Homework Title"
                    name="title"
                    size="small"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </ShakingTextField>
              </Grid>

              {/* Homework Type */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.homeworkType && formik.errors.homeworkType) || false}
                >
                  <CustomSelect
                    label="Homework Type *"
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

              {/* Description */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description) || false}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description *"
                    placeholder="Enter Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={formik.touched.description && formik.errors.description}
                  />
                </ShakingTextField>
              </Grid>

              {/* File Upload */}
              <Grid item xs={12} md={6}>
                <UploadBox
                  onDrop={(acceptedFiles) => {
                    formik.setFieldValue('attachments', [
                      ...formik.values.attachments,
                      ...acceptedFiles,
                    ]);
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
                      <Typography variant="body2">Add Attachment</Typography>
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

              {/* Daily Task Checkbox */}
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

              {/* Conditional fields for Daily Task */}
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
                        format="DD/MM/YYYY"
                        value={dayjs(formik.values.endDate)}
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

              {/* Due Date and Time (for non-daily tasks) */}
              {!formik.values.isDailyTask && (
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}
                  >
                    <DateTimePicker
                      label="Due Date"
                      value={dayjs(formik.values.dueDate)}
                      format="DD/MM/YYYY"
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

              {/* Schedule Homework Switch */}
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
                  label="Schedule Homework"
                />
              </Grid>

              {/* Conditional Schedule Date field */}
              {formik.values.isScheduled && (
                <Grid item xs={12} md={6}>
                  <ShakingTextField
                    error={!!(formik.touched.scheduleDate && formik.errors.scheduleDate) || false}
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
                          error: formik.touched.scheduleDate && Boolean(formik.errors.scheduleDate),
                          helperText: formik.touched.scheduleDate && formik.errors.scheduleDate,
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              )}

              {/* Submission Type Radio Group */}
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

export default HomeworkForm;
