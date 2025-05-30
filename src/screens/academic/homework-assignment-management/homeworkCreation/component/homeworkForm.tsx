'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Create } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers';
import {
  Box,
  Grid,
  Radio,
  Paper,
  Button,
  Divider,
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

import { getHomeworkInitialValues } from './homeworkInitialValues';
import { homeworkValidationSchema } from './homeworkValidationSchema';
import HomeworkTypeForm from '../../setting/homeworkType/homeworkTypeForm';

import type { IHomeWorkCreationFormProps } from '../type';

const HomeworkForm: React.FC<IHomeWorkCreationFormProps> = ({
  classes,
  division,
  subject,
  dialog,
  editData,
  onClose,
}) => {
  // State to control homework type dialog visibility
  const homeworkTypeDialog = useBoolean();
  // Configuration for file upload component
  const uploadProps = {
    multiple: true,
    accept: { 'image/*': [] },
  };
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // State to store all available divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store all available classes/standards from the education medium
  const [allClass, setAllClass] = useState<Standards[]>([]);
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
  // State to store available division options for selected class
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Fetch class data using custom query hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getHomeworkInitialValues(editData, classes),
    validationSchema: homeworkValidationSchema,
    onSubmit: (values) => {},
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
                    value={formik.values.class || classes}
                    disabled={!!classes}
                    isLoading={isLoading}
                    labelKey="name"
                    valueKey="id"
                    onChange={(val) => {
                      const selectedClass = classData?.items?.find((i: Standards) => i.id === val);
                      formik.setFieldValue('class', selectedClass?.name || '');
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
                    labelKey="name"
                    valueKey="name"
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
                  error={!!(formik.touched.subject && formik.errors.subject) || false}
                >
                  <CustomSelect
                    label="Subject *"
                    options={[
                      { name: 'Mathematics', label: 'Mathematics' },
                      { name: 'Science', label: 'Science' },
                      { name: 'English', label: 'English' },
                      { name: 'History', label: 'History' },
                      { name: 'Geography', label: 'Geography' },
                      { name: 'Physics', label: 'Physics' },
                      { name: 'Chemistry', label: 'Chemistry' },
                      { name: 'Biology', label: 'Biology' },
                    ]}
                    disabled={!(formik.values.division.length > 0)}
                    value={formik.values.subject}
                    onChange={(val) => formik.setFieldValue('subject', val)}
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.subject && formik.errors.subject) || false}
                    helperText={(formik.touched.subject && formik.errors.subject) || ''}
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
                    disabled={!formik.values.subject}
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
                <Box mt={1} display="flex" justifyContent="flex-end">
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="primary.main"
                    fontSize={12}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => homeworkTypeDialog.onTrue()}
                  >
                    Add Homework Type ?
                  </Typography>
                </Box>

                <CustomDialog
                  open={homeworkTypeDialog.value}
                  handleClose={homeworkTypeDialog.onFalse}
                  title="Add Homework Type"
                >
                  <HomeworkTypeForm
                    onClose={homeworkTypeDialog.onFalse}
                    editData={null}
                    open={homeworkTypeDialog}
                  />
                </CustomDialog>
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
                    placeholder="Homework Description"
                    sx={{ width: '100%' }}
                  />
                </ShakingTextField>
              </Grid>

              {/* File Upload */}
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <SectionCard title="Homework Attachments">
                  <Upload
                    multiple
                    value={formik.values.attachments || []}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                    sx={{
                      p: 2,
                    }}
                  />
                </SectionCard>
              </Grid>

              {/* <Grid item xs={12}>
                <SectionCard title="Homework Schedule Settings">
                  <Grid container spacing={2} p={2}>
             
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

                    {formik.values.isDailyTask && (
                      <Grid item xs={12} md={6}>
                        <ShakingTextField
                          error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                        >
                          <DateTimePicker
                            name="endDate"
                            label="Select End Date"
                            format="DD/MM/YYYY hh:mm "
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
                    )}

                    {!formik.values.isDailyTask && (
                      <Grid item xs={12} md={6}>
                        <ShakingTextField
                          error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}
                        >
                          <DateTimePicker
                            label="Due Date Time"
                            value={dayjs(formik.values.dueDate)}
                            format="DD/MM/YYYY hh:mm"
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
                  </Grid>
                </SectionCard>
              </Grid> */}

              {/* Schedule Homework Switch */}
              <Grid item xs={12}>
                <SectionCard title="Schedule Homework">
                  <Grid container spacing={2} p={2}>
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={!!(formik.touched.startDate && formik.errors.startDate) || false}
                      >
                        <DateTimePicker
                          label="Start Date Time *"
                          value={dayjs(formik.values.startDate)}
                          format="DD/MM/YYYY hh:mm"
                          onChange={(date) => formik.setFieldValue('startDate', date)}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true,
                              error: formik.touched.startDate && Boolean(formik.errors.startDate),
                              helperText: formik.touched.startDate && formik.errors.startDate,
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                    {/* Conditional Schedule Date field */}
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={!!(formik.touched.endDate && formik.errors.endDate) || false}
                      >
                        <DateTimePicker
                          label="End Date Time *"
                          value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                          format="DD/MM/YYYY hh:mm"
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
                  </Grid>
                </SectionCard>
              </Grid>

              {/* Submission Type Radio Group */}
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
              onClick={() => {
                if (editData) {
                  onClose(null, false);
                } else {
                  formik.setFieldValue('status', 0);
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
                formik.setFieldValue('status', 1);
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

export const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Paper sx={{ p: 3 }} elevation={6}>
    <Typography variant="h6" sx={{ mb: 2 }} color="primary.main">
      {title}
    </Typography>
    <Grid container spacing={2}>
      {children}
    </Grid>
  </Paper>
);
