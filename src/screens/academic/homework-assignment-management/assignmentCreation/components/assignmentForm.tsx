'use client';

import type { Division, Standards } from 'src/types/school';

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

import { getAssignmentInitialValues } from './assignmentInitialValues';
import { AddCategory } from '../../setting/addHomworkAssessmentTypeForm';
import { assignmentValidationSchema } from './assignmentValidationSchema';

import type { IAssignmentFormProps } from '../type';

const AssignmentForm: React.FC<IAssignmentFormProps> = ({ dialog, editData, onClose }) => {
  // State to control assignment type dialog visibility
  const assignmentTypeDialog = useBoolean();

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
    initialValues: getAssignmentInitialValues(editData),
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

              {/* Schedule Assignment */}
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
                  label="Schedule Assignment"
                />
              </Grid>
              {formik.values.isScheduled && (
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Schedule Date"
                    format="DD/MM/YYYY"
                    value={formik.values.scheduleDate}
                    onChange={(date) => formik.setFieldValue('scheduleDate', date)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: formik.touched.scheduleDate && Boolean(formik.errors.scheduleDate),
                        helperText:
                          formik.touched.scheduleDate &&
                          typeof formik.errors.scheduleDate === 'string'
                            ? formik.errors.scheduleDate
                            : undefined,
                      },
                    }}
                  />
                </Grid>
              )}

              {/* Rubric Required */}
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.rubricRequired}
                      onChange={(e) => formik.setFieldValue('rubricRequired', e.target.checked)}
                    />
                  }
                  label="Rubric Required"
                />
              </Grid>

              {/* Conditional Rubric fields */}
              {formik.values.rubricRequired && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Rubric"
                      placeholder="Enter rubric details"
                      name="rubric"
                      value={formik.values.rubric}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Rubric Attachments
                    </Typography>
                    <UploadBox
                      onDrop={(acceptedFiles) => {
                        formik.setFieldValue('rubricAttachment', [
                          ...formik.values.rubricAttachment,
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
                          <Typography variant="body2">Add Rubric Attachment</Typography>
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
                </>
              )}

              {/* Submission Type Radio Group */}
              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                >
                  <Typography variant="subtitle2">Submission Type *</Typography>
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
