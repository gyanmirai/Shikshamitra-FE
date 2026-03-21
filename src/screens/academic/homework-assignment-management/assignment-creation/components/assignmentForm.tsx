'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Stack,
  Button,
  TextField,
  Typography,
  FormControl,
} from '@mui/material';
import {
  useAddAssignmentMutation,
  useUpdateAssignmentMutation,
} from 'src/redux/academic-api/homework-assignment-api/learning-tasks-api/assignment-api';

import { getAssignmentInitialValues } from './assignmentInitialValues';
import { assignmentValidationSchema } from './assignmentValidationSchema';

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

const cardStyle = {
  p: 2,
  borderRadius: 2,
  boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
  border: '1px solid rgba(145, 158, 171, 0.08)',
};

const SubmissionTypeCard = ({
  value,
  label,
  selected,
  onClick,
}: {
  value: number;
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <Box
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      p: 2,
      borderRadius: 2,
      border: (theme) =>
        `1px solid ${selected ? theme.palette.primary.main : theme.palette.grey[300]}`,
      bgcolor: (theme) => (selected ? alpha(theme.palette.primary.main, 0.08) : 'transparent'),
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      '&:hover': {
        borderColor: 'primary.main',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
      },
    }}
  >
    <Radio checked={selected} value={value} sx={{ p: 0 }} />
    <Typography variant="subtitle2" color={selected ? 'primary.dark' : 'text.primary'}>
      {label}
    </Typography>
  </Box>
);

const AssignmentForm: React.FC<IAssignmentFormProps> = ({ classes, dialog, editData, onClose }) => {
  // State to control assignment type dialog visibility
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );

  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [addAssignment, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAssignmentMutation,
  });
  const [updateAssignment, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentMutation,
  });
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
  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getAssignmentInitialValues(editData, classes),
    validationSchema: assignmentValidationSchema(currentYear),
    onSubmit: async (values) => {
      try {
        const payload = {
          classId: values.classId,
          subjectId: values.subjectId,
          title: values.title,
          description: values.description,
          assignmentTypeId: values.assignmentTypeId,
          totalMarks: values.totalMarks,
          submissionType: values.submissionType,
          attachment: values.attachments,
          divisionSchedules: values.divisions.map((division: any) => ({
            divisionId: division.divisionId,
            publishAt: division.publishDate.toISOString(),
            dueAt: division.dueDate.toISOString(),
          })),
        };

        if (editData) {
          // For update, include the assignment ID
          const updatePayload = {
            assignmentId: editData.id,
            body: payload,
          };
          await updateAssignment(updatePayload).unwrap();
          shikshaMitraToast.success({
            message: `Assignment "${values.title}" has been updated successfully.`,
          });
        } else {
          await addAssignment({ academicMediumId: medium?.id, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `Assignment "${values.title}" has been created successfully.`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        shikshaMitraToast.error({ message: error?.data?.message || 'Failed to save assignment.' });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        component="form"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.neutral',
        }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container>
            {/* Basic Details Section */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Basic Details"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Define the core details of the assignment
                  </Typography>
                }
              >
                {/* Class */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.classId && formik.errors.classId)}>
                    <CustomSelect
                      label="Class *"
                      options={allClass}
                      value={formik.values.classId}
                      labelKey="name"
                      valueKey="id"
                      onChange={(val) => {
                        formik.setFieldValue('classId', val);
                        const standard = allClass.find((org: any) => org?.id === val);
                        formik.setFieldValue('className', standard?.name);
                        setAllDivision(standard?.divisions || []);
                      }}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={!!(formik.touched.classId && formik.errors.classId)}
                      helperText={(formik.touched.classId && formik.errors.classId) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Division */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      label="Division *"
                      multiple
                      options={allDivision}
                      value={formik.values.divisions.map((d) => d.divisionId)}
                      onChange={(val) => {
                        const selectedDivs = val as string[];
                        const existingDivs = formik.values.divisions || [];

                        const newDivisions = selectedDivs.map((divId) => {
                          const selectedDivData = allDivision.find((d) => d.id === divId);

                          const existing = existingDivs.find((d) => d.divisionId === divId);

                          return (
                            existing || {
                              divisionId: divId,
                              divisionName: selectedDivData?.name || '', // ← store division name here
                              createdAt: dayjs(),
                              publishDate: null,
                              dueDate: null,
                            }
                          );
                        });

                        formik.setFieldValue('divisions', newDivisions);
                        formik.setFieldValue('students', selectedDivs.length ? allStudentIds : []);
                      }}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={!!(formik.touched.divisions && formik.errors.divisions)}
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

                {/* Subject */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.subjectId && formik.errors.subjectId)}>
                    <CustomSelect
                      label="Subject *"
                      disabled={!formik.values.divisions.length}
                      options={[
                        { value: 'Mathematics', label: 'Mathematics' },
                        { value: 'Science', label: 'Science' },
                        { value: 'History', label: 'History' },
                        { value: 'English', label: 'English' },
                      ]}
                      value={formik.values.subjectId}
                      onChange={(val) => formik.setFieldValue('subjectId', val)}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.subjectId && formik.errors.subjectId)}
                      helperText={(formik.touched.subjectId && formik.errors.subjectId) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Assignment Title */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                    <TextField
                      fullWidth
                      label="Assignment Title *"
                      name="title"
                      size="small"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.assignmentTypeId && formik.errors.assignmentTypeId)}
                  >
                    <CustomSelect
                      label="Assignment Type *"
                      options={[
                        { label: 'Regular', value: 'Regular' },
                        { label: 'Worksheet', value: 'Worksheet' },
                        { label: 'Activity', value: 'Activity' },
                        { label: 'Practice', value: 'Practice' },
                        { label: 'Written Assignment', value: 'written_assignment' },
                        { label: 'Reading Comprehension', value: 'reading_comprehension' },
                        { label: 'Worksheet Practice', value: 'worksheet_practice' },
                        { label: 'Problem Solving', value: 'problem_solving' },
                        { label: 'Essay Writing', value: 'essay_writing' },
                        { label: 'Project Work', value: 'project_work' },
                        { label: 'Research Assignment', value: 'research_assignment' },
                        { label: 'Lab Report', value: 'lab_report' },
                        { label: 'Creative Writing', value: 'creative_writing' },
                        { label: 'Revision Task', value: 'revision_task' },
                      ]}
                      value={formik.values.assignmentTypeId || ''}
                      onChange={(val) => formik.setFieldValue('assignmentTypeId', val)}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.assignmentTypeId && formik.errors.assignmentTypeId)}
                      helperText={
                        (formik.touched.assignmentTypeId && formik.errors.assignmentTypeId) || ''
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}
                  >
                    <TextField
                      fullWidth
                      label="Total Marks *"
                      type="number"
                      name="totalMarks"
                      value={formik.values.totalMarks}
                      onChange={formik.handleChange}
                      error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                      helperText={formik.touched.totalMarks && formik.errors.totalMarks}
                      size="small"
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                      }}
                    />
                  </ShakingTextField>
                </Grid>
              </SectionCard>
            </Grid>

            {/* Description Section */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Description & Attachments"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Provide instructions and upload necessary files
                  </Typography>
                }
              >
                <Grid size={{ xs: 12 }}>
                  <ShakingTextField
                    error={!!(formik.touched.description && formik.errors.description)}
                  >
                    <Editor
                      value={formik.values.description}
                      onChange={(value) => formik.setFieldValue('description', value)}
                      placeholder="Write a clear description..."
                      error={!!(formik.touched.description && formik.errors.description)}
                      helperText={(formik.touched.description && formik.errors.description) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FileUploader
                    value={formik.values.attachments}
                    multiple
                    showVisibleDocumentCount={1}
                    onChange={(value) => formik.setFieldValue('attachments', value)}
                    primaryText="Upload Reference File"
                    secondaryText="Supports PDF, DOCX, IMG (Max 5MB)"
                  />
                </Grid>
              </SectionCard>
            </Grid>

            {/* Schedule Assignment */}
            {formik.values.divisions.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Schedule & Deadlines"
                  paperProps={{ sx: cardStyle }}
                  headerContent={
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Set publish and due dates for each division
                    </Typography>
                  }
                >
                  <Grid container spacing={2} sx={{ width: '100%' }}>
                    {formik.values.divisions.map((div, idx) => (
                      <Grid size={{ xs: 12 }} key={div.divisionId}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems="center"
                            spacing={3}
                          >
                            <Box sx={{ minWidth: 80 }}>
                              <Chip
                                label={`Div ${div.divisionName}`}
                                color="primary"
                                variant="soft"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>

                            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <ShakingTextField
                                  error={
                                    !!(
                                      typeof formik.errors.divisions?.[idx] === 'object' &&
                                      (formik.errors.divisions?.[idx] as any)?.publishDate &&
                                      formik.touched.divisions?.[idx]?.publishDate
                                    )
                                  }
                                >
                                  <DateTimePicker
                                    label="Publish Date *"
                                    value={div.publishDate}
                                    onChange={(val) =>
                                      formik.setFieldValue(`divisions[${idx}].publishDate`, val)
                                    }
                                    minDate={dayjs(currentYear?.startDate)}
                                    maxDate={dayjs(currentYear?.endDate)}
                                    format="DD/MM/YYYY hh:mm"
                                    slotProps={{
                                      textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        error: !!(
                                          typeof formik.errors.divisions?.[idx] === 'object' &&
                                          formik.errors.divisions?.[idx]?.publishDate &&
                                          formik.touched.divisions?.[idx]?.publishDate
                                        ),
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

                              <Grid size={{ xs: 12, md: 6 }}>
                                <ShakingTextField
                                  error={
                                    !!(
                                      typeof formik.errors.divisions?.[idx] === 'object' &&
                                      formik.errors.divisions?.[idx]?.dueDate &&
                                      formik.touched.divisions?.[idx]?.dueDate
                                    )
                                  }
                                >
                                  <DateTimePicker
                                    label="Due Date *"
                                    value={div.dueDate}
                                    onChange={(val) =>
                                      formik.setFieldValue(`divisions[${idx}].dueDate`, val)
                                    }
                                    disabled={!div.publishDate}
                                    format="DD/MM/YYYY hh:mm"
                                    minDate={dayjs(currentYear?.startDate)}
                                    maxDate={dayjs(currentYear?.endDate)}
                                    slotProps={{
                                      textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        error: !!(
                                          typeof formik.errors.divisions?.[idx] === 'object' &&
                                          formik.errors.divisions?.[idx]?.dueDate &&
                                          formik.touched.divisions?.[idx]?.dueDate
                                        ),
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
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </SectionCard>
              </Grid>
            )}

            {/* Submission Type & Action Buttons */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Submission Type"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    How should students submit this assignment?
                  </Typography>
                }
              >
                <FormControl
                  component="fieldset"
                  error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                  fullWidth
                >
                  <Grid container spacing={2}>
                    {[
                      { value: 0, label: 'Online Text' },
                      { value: 1, label: 'File Upload' },
                      { value: 2, label: 'In-Person' },
                    ].map((item) => (
                      <Grid size={{ xs: 12, md: 4 }} key={item.value}>
                        <SubmissionTypeCard
                          value={item.value}
                          label={item.label}
                          selected={formik.values.submissionType === item.value}
                          onClick={() => formik.setFieldValue('submissionType', item.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {formik.touched.submissionType && formik.errors.submissionType && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1 }}>
                      {formik.errors.submissionType}
                    </Typography>
                  )}
                </FormControl>
              </SectionCard>
            </Grid>
          </Grid>
        </Scrollbar>

        {/* Action Buttons */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Button
            variant="outlined"
            onClick={() => onClose(null, false)}
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            loading={isUpdateLoading || isAddLoading}
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={editData ? 16 : 20}
                height={editData ? 16 : 20}
              />
            }
            onClick={(e: any) => {
              formik.handleSubmit(e);
            }}
            type="submit"
          >
            {editData ? 'Update' : 'Create'}
          </LoadingButton>
        </Box>
      </Box>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
