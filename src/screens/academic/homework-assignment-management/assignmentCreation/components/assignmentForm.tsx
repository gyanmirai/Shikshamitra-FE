'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

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

import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getAssignmentInitialValues } from './assignmentInitialValues';
import { assignmentValidationSchema } from './assignmentValidationSchema';
import AssignmentTypeForm from '../../setting/assignmentType/assignmentTypeForm';

import type { IAssignmentFormProps } from '../type';

export const allStudentIds = [
  'st1',
  'st2',
  'st3',
  'st4',
  'st5',
  'st6',
  'st7',
  'st8',
  'st9',
  'st10',
  'st11',
  'st12',
  'st13',
  'st14',
  'st15',
  'st16',
  'st17',
  'st18',
  'st19',
  'st20',
  'st21',
  'st22',
  'st23',
  'st24',
  'st25',
];

const AssignmentForm: React.FC<IAssignmentFormProps> = ({ classes, dialog, editData, onClose }) => {
  // State to control assignment type dialog visibility
  const assignmentTypeDialog = useBoolean();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
  }, [allClass, classes]);

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getAssignmentInitialValues(editData, classes),
    validationSchema: assignmentValidationSchema(currentYear),
    onSubmit: (values) => {
      onClose(null, true);
      shikshaMitraToast.success({
        message: `Assignment Added successfully for ${values.subjects}!`,
      });
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
      <Box
        component="form"
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar
          sx={{
            px: 1,
            height: '100%',
          }}
        >
          {/* Basic Details Section */}
          <Grid item xs={12}>
            <SectionCard title="Basic Details">
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.class && formik.errors.class) || false}>
                  <CustomSelect
                    label="Class *"
                    options={allClass}
                    value={formik.values.class || classes}
                    // disabled={!!classes}
                    labelKey="name"
                    valueKey="name"
                    onChange={(val) => {
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
                  error={!!(formik.touched.divisions && formik.errors.divisions) || false}
                >
                  <CustomSelect
                    label="Division *" // Select division from dropdown
                    labelKey="name"
                    valueKey="name"
                    multiple
                    options={allDivision}
                    value={formik.values.divisions.map((d) => d.divisionId)} // value = selected division IDs
                    onChange={(val) => {
                      const selectedDivs = val as string[];
                      const existingDivs = formik.values.divisions || [];

                      const newDivisions = selectedDivs.map((divId) => {
                        const existing = existingDivs.find((d) => d.divisionId === divId);
                        return (
                          existing || {
                            divisionId: divId,
                            createdAt: dayjs(),
                            publishDate: null,
                            dueDate: null,
                          }
                        );
                      });

                      formik.setFieldValue('divisions', newDivisions);

                      // ✅ If no division is selected, clear students
                      if (selectedDivs.length === 0) {
                        formik.setFieldValue('students', []);
                      } else {
                        formik.setFieldValue('students', allStudentIds);
                      }
                    }}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={Boolean(formik.touched.divisions && formik.errors.divisions)}
                    helperText={
                      formik.touched.divisions &&
                      (typeof formik.errors.divisions === 'string'
                        ? formik.errors.divisions
                        : formik.errors.divisions?.some(
                              (divErr: any) =>
                                typeof divErr === 'object' &&
                                (divErr?.publishDate || divErr?.dueDate)
                            )
                          ? 'Select schedule dates also'
                          : undefined)
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
                    disabled={!formik.values.divisions || formik.values.divisions.length === 0}
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
                      { value: 'Drawing', label: 'Drawing' },
                      { value: 'Worksheet', label: 'Worksheet' },
                      { value: 'Essay', label: 'Essay' },
                      { value: 'Project', label: 'Project' },
                      { value: 'Quiz', label: 'Quiz' },
                      { value: 'Presentation', label: 'Presentation' },
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
                {/* <Box mt={1} display="flex" justifyContent="flex-end">
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
                </Box> */}

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

              {/* Total Marks */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.totalMarks && formik.errors.totalMarks) || false}
                >
                  <TextField
                    fullWidth
                    label="Total Marks"
                    name="totalMarks"
                    size="small"
                    type="number"
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                    helperText={formik.touched.totalMarks && formik.errors.totalMarks}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.students && formik.errors.students) || false}
                >
                  <ResponsiveMultiSelect
                    label="Students"
                    disabled={!formik.values.divisions || formik.values.divisions.length === 0}
                    options={[
                      { id: 'all', name: 'All' },
                      { id: 'st1', name: 'Sharma Amit Raj' },
                      { id: 'st2', name: 'Verma Priya Suresh' },
                      { id: 'st3', name: 'Mehta Rahul Kishore' },
                      { id: 'st4', name: 'Kapoor Sneha Anil' },
                      { id: 'st5', name: 'Patel Vikram Harish' },
                      { id: 'st6', name: 'Nair Anjali Mohan' },
                      { id: 'st7', name: 'Malhotra Karan Dev' },
                      { id: 'st8', name: 'Desai Pooja Ramesh' },
                      { id: 'st9', name: 'Reddy Rohit Kumar' },
                      { id: 'st10', name: 'Joshi Neha Pravin' },
                      { id: 'st11', name: 'Singh Arjun Vikrant' },
                      { id: 'st12', name: 'Iyer Deepika Suresh' },
                      { id: 'st13', name: 'Das Siddharth Manoj' },
                      { id: 'st14', name: 'Rao Meera Subhash' },
                      { id: 'st15', name: 'Gupta Rohan Mahesh' },
                      { id: 'st16', name: 'Mishra Swati Nilesh' },
                      { id: 'st17', name: 'Tripathi Nikhil Satish' },
                      { id: 'st18', name: 'Chopra Ananya Rajeev' },
                      { id: 'st19', name: 'Bhatia Aditya Omprakash' },
                      { id: 'st20', name: 'Kulkarni Tanya Yogesh' },
                      { id: 'st21', name: 'Thakur Manav Dinesh' },
                      { id: 'st22', name: 'Pillai Kavya Raghav' },
                      { id: 'st23', name: 'Naidu Harsh Vikas' },
                      { id: 'st24', name: 'Khan Sana Imran' },
                      { id: 'st25', name: 'Ahmed Zoya Farhan' },
                    ]}
                    value={
                      formik.values.students.length === allStudentIds.length
                        ? ['all', ...formik.values.students]
                        : formik.values.students
                    }
                    onChange={(val) => {
                      const hasAll = val.includes('all');
                      const currentStudents = formik.values.students;
                      const hadAll = currentStudents.length === allStudentIds.length;

                      // Handle clicking "All" checkbox
                      if (hasAll && !hadAll) {
                        formik.setFieldValue('students', allStudentIds);
                      } else if (!hasAll && hadAll) {
                        formik.setFieldValue('students', []);
                      } else {
                        // Handle individual student selections
                        const newStudents = val.filter((id) => id !== 'all');

                        // If all individual students are selected, add 'all'
                        if (newStudents.length === allStudentIds.length) {
                          formik.setFieldValue('students', allStudentIds);
                        } else {
                          formik.setFieldValue('students', newStudents);
                        }
                      }
                    }}
                    getOptionLabel={(opt) => opt.name}
                    getOptionValue={(opt) => opt.id}
                    error={formik.touched.students && Boolean(formik.errors.students)}
                    helperText={(formik.touched.students && formik.errors.students) as string}
                  />
                </ShakingTextField>
              </Grid>
            </SectionCard>
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

          {/* Description Section */}
          <SectionCard title="Description and Document">
            <Grid item xs={12}>
              {' '}
              <ShakingTextField
                error={!!(formik.touched.description && formik.errors.description) || false}
              >
                <Editor
                  value={formik.values.description}
                  onChange={(value) => {
                    formik.setFieldValue('description', value);
                  }}
                  placeholder="Description"
                />
              </ShakingTextField>
            </Grid>

            {/* File Upload */}
            <Grid item xs={12}>
              <FileUploader
                // @ts-ignore
                value={formik.values.attachments}
                multiple
                showVisibleDocumentCount={1}
                onChange={(value) => {
                  // const reader = new FileReader();
                  formik.setFieldValue('attachments', value);
                  // reader.readAsDataURL(value as File);
                  // reader.readAsDataURL(value as File);
                  // reader.onload = () => {
                  //   const base64String = reader.result;
                  // };
                }}
                primaryText="Please Upload Your File"
                secondaryText="Maximum file size is 5MB"
              />
            </Grid>
          </SectionCard>

          {/* Schedule Assignment */}
          {formik.values.divisions.length > 0 && (
            <Grid item xs={12}>
              <SectionCard title="Schedule Assignment">
                {formik.values.divisions.map((div, idx) => (
                  <Grid container spacing={3} key={div.divisionId} ml={0.4}>
                    <Grid item xs={12} mt={2}>
                      <Typography variant="subtitle2" sx={{ mt: 1, mb: -1, lineHeight: 1.2 }}>
                        Div : {div.divisionId}
                      </Typography>
                    </Grid>

                    {/* Publish Date */}
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={
                          typeof formik.errors.divisions?.[idx] === 'object' &&
                          !!(formik.errors.divisions?.[idx] as any)?.publishDate &&
                          !!formik.touched.divisions?.[idx]?.publishDate
                        }
                      >
                        <DateTimePicker
                          label="Publish Date *"
                          format="DD/MM/YYYY"
                          value={div.publishDate ? dayjs(div.publishDate) : null}
                          onChange={(val) =>
                            formik.setFieldValue(`divisions[${idx}].publishDate`, val)
                          }
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          minDateTime={dayjs()} // Prevent selecting dates before today
                          slotProps={{
                            popper: {
                              placement: 'top-start',
                              sx: { zIndex: 1300 },
                            },
                            textField: {
                              fullWidth: true,
                              size: 'small',

                              error:
                                typeof formik.errors.divisions?.[idx] === 'object' &&
                                !!(formik.errors.divisions?.[idx] as any)?.publishDate &&
                                !!formik.touched.divisions?.[idx]?.publishDate,
                              helperText:
                                formik.touched.divisions?.[idx]?.publishDate &&
                                typeof formik.errors.divisions?.[idx] === 'object'
                                  ? (formik.errors.divisions?.[idx] as any)?.publishDate
                                  : '',
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>

                    {/* Due Date */}
                    <Grid item xs={12} md={6}>
                      <ShakingTextField
                        error={
                          typeof formik.errors.divisions?.[idx] === 'object' &&
                          !!(formik.errors.divisions?.[idx] as any)?.dueDate &&
                          !!formik.touched.divisions?.[idx]?.dueDate
                        }
                      >
                        <DateTimePicker
                          label="Due Date *"
                          format="DD/MM/YYYY"
                          value={div.dueDate ? dayjs(div.dueDate) : null}
                          onChange={(val) => formik.setFieldValue(`divisions[${idx}].dueDate`, val)}
                          minDateTime={dayjs()} // Prevent selecting dates before today
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          slotProps={{
                            popper: {
                              placement: 'top-start',
                              sx: { zIndex: 1300 },
                            },
                            textField: {
                              fullWidth: true,
                              size: 'small',
                              error:
                                typeof formik.errors.divisions?.[idx] === 'object' &&
                                !!(formik.errors.divisions?.[idx] as any)?.dueDate &&
                                !!formik.touched.divisions?.[idx]?.dueDate,
                              helperText:
                                formik.touched.divisions?.[idx]?.dueDate &&
                                typeof formik.errors.divisions?.[idx] === 'object'
                                  ? (formik.errors.divisions?.[idx] as any)?.dueDate
                                  : '',
                            },
                          }}
                        />
                      </ShakingTextField>
                    </Grid>
                  </Grid>
                ))}
              </SectionCard>
            </Grid>
          )}

          <Grid item xs={12} mt={3} mb={1}>
            <SectionCard title="Submission Type">
              <FormControl
                component="fieldset"
                error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                sx={{ p: 2, ml: 1 }}
              >
                <RadioGroup
                  row
                  name="submissionType"
                  value={formik.values.submissionType?.toString()} // Convert number to string for matching
                  onChange={(event) =>
                    formik.setFieldValue('submissionType', Number(event.target.value))
                  } // Convert back to number
                >
                  <FormControlLabel value="0" control={<Radio />} label="Online Text" />
                  <FormControlLabel value="1" control={<Radio />} label="File Upload" />
                  <FormControlLabel value="2" control={<Radio />} label="In-Person Submission" />
                </RadioGroup>
                {formik.touched.submissionType && formik.errors.submissionType && (
                  <Typography variant="caption" color="error">
                    {formik.errors.submissionType}
                  </Typography>
                )}
              </FormControl>
            </SectionCard>
          </Grid>
        </Scrollbar>
      </Box>
      {/* Action Buttons */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
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
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
