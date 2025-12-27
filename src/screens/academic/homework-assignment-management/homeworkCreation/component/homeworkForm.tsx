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
import { useBoolean } from 'src/hooks/use-boolean';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  useAddHomeworkMutation,
  useUpdateHomeworkMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Button,
  TextField,
  RadioGroup,
  Typography,
  FormControl,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { getHomeworkInitialValues } from './homeworkInitialValues';
import { homeworkValidationSchema } from './homeworkValidationSchema';
import HomeworkTypeForm from '../../setting/homeworkType/homeworkTypeForm';

import type { IHomeWorkCreationFormProps } from '../type';

const HomeworkForm: React.FC<IHomeWorkCreationFormProps> = ({
  classes,
  subject,
  dialog,
  editData,
  onClose,
}) => {
  const [addHomework, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddHomeworkMutation,
  });
  const [updateHomework, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkMutation,
  });
  // Get current academic year from global state for date validation and filtering
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // State to control homework type dialog visibility
  const homeworkTypeDialog = useBoolean();

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
  }, [allClass, classes]);
  // State to store available division options for selected class
  // const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getHomeworkInitialValues(editData, classes),
    validationSchema: homeworkValidationSchema(currentYear),
    onSubmit: async (values) => {
      try {
        const payload = {
          classId: values.classId,
          subjectId: values.subjectId,
          title: values.title,
          description: values.description,
          assignmentTypeId: values.homeworkTypeId,
          submissionType: values.submissionType,
          attachments: values.attachments,
          divisions: values.divisions.map((division: any) => ({
            divisionId: division.divisionId,
            publishDate: division.publishDate.toISOString(),
            dueDate: division.dueDate.toISOString(),
          })),
        };

        if (editData) {
          // For update, include the assignment ID
          const updatePayload = {
            id: editData.id,
            body: payload,
          };
          await updateHomework({ academicMediumId: medium?.id, ...updatePayload }).unwrap();
          shikshaMitraToast.success({
            message: `Homework "${values.title}" has been updated successfully.`,
          });
        } else {
          await addHomework({ academicMediumId: medium?.id, ...payload }).unwrap();
          shikshaMitraToast.success({
            message: `Homework "${values.title}" has been created successfully.`,
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
        <Scrollbar
          sx={{
            height: '100%',
            px: 1,
          }}
        >
          {/* Basic Details Section */}

          {/* Class Selection */}
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Basic Details">
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                  <CustomSelect
                    label="Class *"
                    options={allClass}
                    value={formik.values.class || classes}
                    labelKey="name"
                    valueKey="name"
                    onChange={(val) => formik.setFieldValue('class', val)}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                    error={!!(formik.touched.class && formik.errors.class)}
                    helperText={(formik.touched.class && formik.errors.class) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                  <CustomSelect
                    label="Division *"
                    labelKey="name"
                    valueKey="name"
                    multiple
                    options={allDivision}
                    value={formik.values.divisions.map((d) => d.divisionId)}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject)}>
                  <CustomSelect
                    label="Subject *"
                    disabled={!formik.values.divisions || formik.values.divisions.length === 0}
                    options={[
                      { value: 'Mathematics', label: 'Mathematics' },
                      { value: 'Science', label: 'Science' },
                      { value: 'History', label: 'History' },
                      { value: 'English', label: 'English' },
                    ]}
                    value={formik.values.subject}
                    onChange={(val) => formik.setFieldValue('subject', val)}
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.subject && formik.errors.subject)}
                    helperText={(formik.touched.subject && formik.errors.subject) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.chapter && formik.errors.chapter)}>
                  <Autocomplete
                    options={[
                      { id: 'n1', name: '1. Numbers and Number Systems' },
                      { id: 'a1', name: '2. Algebra' },
                      { id: 'g1', name: '3. Geometry' },
                      { id: 'm1', name: '4. Mensuration' },
                      { id: 'r1', name: '5. Ratio and Proportion' },
                      { id: 'p1', name: '6. Profit and Loss' },
                      { id: 'i1', name: '7. Interest' },
                      { id: 'f1', name: '8. Fractions and Decimals' },
                      { id: 'e1', name: '9. Equations' },
                      { id: 's1', name: '10. Sets' },
                      { id: 't1', name: '11. Time and Work' },
                      { id: 'd1', name: '12. Data Handling' },
                    ]}
                    disabled={!formik.values.subject}
                    value={
                      formik.values.chapter
                        ? { id: formik.values.chapter, name: formik.values.chapter }
                        : null
                    }
                    onChange={(event, newValue) => {
                      formik.setFieldValue('chapter', newValue?.name || '');
                    }}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chapter"
                        error={formik.touched.chapter && Boolean(formik.errors.chapter)}
                        helperText={(formik.touched.chapter && formik.errors.chapter) as string}
                        size="small"
                        fullWidth
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                  <TextField
                    fullWidth
                    label="Homework Title *"
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
                  error={!!(formik.touched.homeworkTypeId && formik.errors.homeworkTypeId)}
                >
                  <CustomSelect
                    label="Homework Type *"
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
                    value={formik.values.homeworkTypeId || ''}
                    onChange={(val) => formik.setFieldValue('homeworkTypeId', val)}
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.homeworkTypeId && formik.errors.homeworkTypeId)}
                    helperText={
                      (formik.touched.homeworkTypeId && formik.errors.homeworkTypeId) || ''
                    }
                  />
                </ShakingTextField>

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
            </SectionCard>
          </Grid>

          {/* Description Section */}
          <Grid size={{ xs: 12 }}>
            <SectionCard title="Description and Document">
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description)}
                >
                  <Editor
                    value={formik.values.description}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    placeholder="Description"
                    error={!!(formik.touched.description && formik.errors.description)}
                    helperText={(formik.touched.description && formik.errors.description) || ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FileUploader
                  value={formik.values.attachments as any}
                  multiple={false}
                  showVisibleDocumentCount={1}
                  onChange={(value) => formik.setFieldValue('attachments', value)}
                  primaryText="Please Upload Your File"
                  secondaryText="Maximum file size is 5MB"
                />
              </Grid>
            </SectionCard>
          </Grid>

          {/* Schedule Homework Section */}
          {formik.values.divisions.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <SectionCard title="Schedule Homework">
                {formik.values.divisions.map((div, idx) => (
                  <Grid container spacing={3} key={div.divisionId} ml={0.4}>
                    <Grid size={{ xs: 12 }} mt={2}>
                      <Typography variant="subtitle2" sx={{ mt: 1, mb: -1, lineHeight: 1.2 }}>
                        Div: {div.divisionId}
                      </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField
                        error={
                          typeof formik.errors.divisions?.[idx] === 'object' &&
                          !!(formik.errors.divisions?.[idx] as any)?.publishDate &&
                          !!formik.touched.divisions?.[idx]?.publishDate
                        }
                      >
                        <DateTimePicker
                          label="Publish Date *"
                          format="DD/MM/YYYY hh:mm"
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          minDateTime={dayjs()}
                          value={div.publishDate ? dayjs(div.publishDate) : dayjs()}
                          onChange={(val) => {
                            formik.setFieldValue(`divisions[${idx}].publishDate`, val);
                            formik.validateField(`divisions[${idx}].publishDate`);
                          }}
                          ampm={false}
                          slotProps={{
                            popper: { placement: 'top-start', sx: { zIndex: 1300 } },
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

                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField
                        error={
                          typeof formik.errors.divisions?.[idx] === 'object' &&
                          !!(formik.errors.divisions?.[idx] as any)?.dueDate &&
                          !!formik.touched.divisions?.[idx]?.dueDate
                        }
                      >
                        <DateTimePicker
                          label="Due Date *"
                          format="DD/MM/YYYY hh:mm"
                          minDate={dayjs(currentYear?.startDate)}
                          maxDate={dayjs(currentYear?.endDate)}
                          value={div.dueDate ? dayjs(div.dueDate) : dayjs()}
                          onChange={(val) => formik.setFieldValue(`divisions[${idx}].dueDate`, val)}
                          disabled={!div.publishDate}
                          ampm={false}
                          slotProps={{
                            popper: { placement: 'top-start', sx: { zIndex: 1300 } },
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

          {/* Submission Type */}
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

export default HomeworkForm;

// export const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
//   <Paper sx={{ p: 3 }} elevation={6}>
//     <Typography variant="h6" sx={{ mb: 2 }} color="primary.main">
//       {title}
//     </Typography>
//     <Grid container spacing={2}>
//       {children}
//     </Grid>
//   </Paper>
// );

export const TeacherListPopover = ({
  data,
  count,
}: {
  data: Record<string, string>[];
  count: number;
}) => (
  <CustomTooltip
    title={
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 1, maxWidth: 230, borderRadius: 1 }}>
        {data.map((value) => (
          <Chip key={value.value} variant="soft" label={value.label} sx={{ mb: 1 }} size="small" />
        ))}
      </Box>
    }
    placement="bottom-start"
    arrow
  >
    <Chip label={`+${count}`} sx={{ ml: 0.5, cursor: 'pointer' }} size="small" variant="soft" />
  </CustomTooltip>
);
