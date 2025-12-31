'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
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
  useAddAssignmentMutation,
  useUpdateAssignmentMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';
import {
  Box,
  Grid,
  Radio,
  Button,
  TextField,
  Typography,
  RadioGroup,
  FormControl,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

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
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
        onSubmit={formik.handleSubmit}
      >
        <Scrollbar sx={{ px: 1, height: '100%' }}>
          {/* Basic Details Section */}
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Basic Details">
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

              <Grid size={{ xs: 12, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}>
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

              {/* Continue other fields (Assignment Type, Total Marks, Students) similarly using size={{ xs: ..., md: ... }} */}
            </SectionCard>
          </Grid>

          {/* Description Section */}
          <SectionCard title="Description and Document">
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
                <Editor
                  value={formik.values.description}
                  onChange={(value) => formik.setFieldValue('description', value)}
                  placeholder="Description"
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FileUploader
                value={formik.values.attachments}
                multiple
                showVisibleDocumentCount={1}
                onChange={(value) => formik.setFieldValue('attachments', value)}
                primaryText="Please Upload Your File"
                secondaryText="Maximum file size is 5MB"
              />
            </Grid>
          </SectionCard>

          {/* Schedule Assignment */}
          {formik.values.divisions.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Schedule Assignment">
                {formik.values.divisions.map((div, idx) => (
                  <Grid container spacing={3} key={div.divisionId} ml={0.4}>
                    <Grid size={{ xs: 12 }} mt={2}>
                      <Typography variant="subtitle2" sx={{ mt: 1, mb: -1, lineHeight: 1.2 }}>
                        Div : {div.divisionName}
                      </Typography>
                    </Grid>

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
                          // minDateTime={dayjs()}
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
                          onChange={(val) => formik.setFieldValue(`divisions[${idx}].dueDate`, val)}
                          disabled={!div.publishDate}
                          format="DD/MM/YYYY hh:mm"
                          // minDateTime={dayjs()}
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
                ))}
              </SectionCard>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Submission Type">
              <FormControl
                component="fieldset"
                error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                sx={{ p: 2, ml: 1 }}
              >
                <RadioGroup
                  row
                  name="submissionType"
                  value={formik.values.submissionType?.toString()}
                  onChange={(event) =>
                    formik.setFieldValue('submissionType', Number(event.target.value))
                  }
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
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
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
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
