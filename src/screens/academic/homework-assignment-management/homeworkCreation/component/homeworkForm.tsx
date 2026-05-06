'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
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
import { useGetHomeworkTypesQuery } from 'src/redux/academics/homeworkAndAssignment/homeworkTypeApi';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Stack,
  Button,
  Skeleton,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
} from '@mui/material';
import {
  useAddHomeworkMutation,
  useGetHomeworkByIdQuery,
  useUpdateHomeworkMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';

import { getHomeworkInitialValues } from './homeworkInitialValues';
import { homeworkValidationSchema } from './homeworkValidationSchema';
import HomeworkTypeForm from '../../setting/homeworkType/homeworkTypeForm';

import type { IHomeWorkCreationFormProps } from '../type';

export const cardStyle = {
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
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [updateHomework, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkMutation,
  });
  const {
    data: homeworkData,
    isLoading: isHomeworkLoading,
    isFetching: isHomeworkFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworkByIdQuery,
    params: { homeworkId: editData?.id, academicMediumId: medium?.id },
    options: {
      skip: !editData?.id,
    },
  });
  // Get current academic year from global state for date validation and filtering
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // State to control homework type dialog visibility
  const homeworkTypeDialog = useBoolean();

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

  // State to store available division options for selected class
  // const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  // Initialize formik form with validation and submission handling
  const formik = useFormik({
    initialValues: getHomeworkInitialValues(homeworkData?.data, classes),
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: homeworkValidationSchema(currentYear),
    onSubmit: async (values) => {
      try {
        const activeClassId = values.classId || values.class;
        const payload = {
          classId: activeClassId,
          standardId: values.standardId || activeClassId,
          subjectId: values.subjectId || values.subject,
          chapterId: values.chapterId,
          title: values.title,
          description: values.description,
          homeworkTypeId: values.homeworkTypeId,
          submissionType: values.submissionType,
          attachment: values.attachments,
          divisionSchedules: values.divisions.map((division: any) => ({
            divisionId: division.divisionId,
            publishAt: division.publishDate.toISOString(),
            dueAt: division.dueDate.toISOString(),
          })),
        };

        if (editData) {
          // For update, build FormData (PUT endpoint expects multipart/form-data)
          const updateFormData = new FormData();
          updateFormData.append('StandardId', values.standardId || activeClassId);
          updateFormData.append('SubjectId', values.subjectId || values.subject);
          if (values.chapterId) updateFormData.append('ChapterId', values.chapterId);
          updateFormData.append('Title', values.title);
          if (values.description) updateFormData.append('Description', values.description);
          updateFormData.append('HomeworkTypeId', values.homeworkTypeId);
          updateFormData.append('SubmissionType', values.submissionType.toString());

          if (values.attachments && values.attachments.length > 0) {
            values.attachments.forEach((file: any) => {
              updateFormData.append('attachment', file);
            });
          }

          values.divisions.forEach((division: any, index: number) => {
            updateFormData.append(`DivisionSchedules[${index}].DivisionId`, division.divisionId);
            updateFormData.append(
              `DivisionSchedules[${index}].PublishAt`,
              division.publishDate.toISOString()
            );
            updateFormData.append(
              `DivisionSchedules[${index}].DueAt`,
              division.dueDate.toISOString()
            );
          });

          const updatePayload = {
            id: editData.id,
            body: updateFormData,
          };
          await updateHomework(updatePayload).unwrap();
          shikshaMitraToast.success({
            message: `Homework "${values.title}" has been updated successfully.`,
          });
        } else {
          const formData = new FormData();
          formData.append('StandardId', values.standardId || activeClassId);
          formData.append('SubjectId', values.subjectId || values.subject);
          if (values.chapterId) formData.append('ChapterId', values.chapterId);
          formData.append('Title', values.title);
          if (values.description) formData.append('Description', values.description);
          formData.append('HomeworkTypeId', values.homeworkTypeId);
          formData.append('SubmissionType', values.submissionType.toString());

          if (values.attachments && values.attachments.length > 0) {
            values.attachments.forEach((file: any) => {
              formData.append('attachment', file);
            });
          }

          values.divisions.forEach((division: any, index: number) => {
            formData.append(`DivisionSchedules[${index}].DivisionId`, division.divisionId);
            formData.append(
              `DivisionSchedules[${index}].PublishAt`,
              division.publishDate.toISOString()
            );
            formData.append(`DivisionSchedules[${index}].DueAt`, division.dueDate.toISOString());
          });

          await addHomework({ academicMediumId: medium?.id, body: formData }).unwrap();
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

  // Update divisions when class changes
  useEffect(() => {
    const classId = formik.values.classId || formik.values.class;
    setAllDivision(allClass.find((org: any) => org?.id === classId)?.divisions || []);
  }, [allClass, formik.values.class, formik.values.classId]);

  // Fetch subjects for the selected class
  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      standardId: formik.values.classId || formik.values.class,
    },
    options: {
      skip: !(formik.values.classId || formik.values.class),
    },
  });

  const {
    data: chapterResponse,
    isLoading: isChapterLoading,
    isFetching: isChapterFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { assignedStandardId: formik.values.subjectId || formik.values.subject },
    options: {
      skip: !(formik.values.subjectId || formik.values.subject),
    },
  });

  const {
    data: homeworkTypeData,
    isLoading: isHomeworkTypeLoading,
    isFetching: isHomeworkTypeFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworkTypesQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !(medium as Medium)?.id,
    },
  });

  const isLoadingData = isHomeworkLoading || isHomeworkFetching;

  if (isLoadingData) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.neutral',
        }}
      >
        <Scrollbar sx={{ height: '100%', p: 2 }}>
          <Grid container>
            {/* Basic Information Skeleton */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ ...cardStyle, mb: 2 }}>
                <Skeleton variant="text" width={180} height={28} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={260} height={20} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[...Array(6)].map((_, i) => (
                    <Grid size={{ xs: 12, md: 6 }} key={i}>
                      <Skeleton variant="rounded" height={40} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>

            {/* Description & Attachments Skeleton */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ ...cardStyle, mb: 2 }}>
                <Skeleton variant="text" width={220} height={28} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={300} height={20} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={160} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={80} />
              </Box>
            </Grid>

            {/* Submission Type Skeleton */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ ...cardStyle, mb: 2 }}>
                <Skeleton variant="text" width={160} height={28} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={280} height={20} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {[...Array(3)].map((_, i) => (
                    <Grid size={{ xs: 12, md: 4 }} key={i}>
                      <Skeleton variant="rounded" height={60} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Scrollbar>

        {/* Action Buttons Skeleton */}
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
          <Skeleton variant="rounded" width={90} height={34} />
          <Skeleton variant="rounded" width={90} height={34} />
        </Box>
      </Box>
    );
  }

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
        <Scrollbar
          sx={{
            height: '100%',
            p: 2,
          }}
        >
          <Grid container>
            {/* Basic Details Section */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Basic Information"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Define the core details of the homework
                  </Typography>
                }
              >
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                    <CustomSelect
                      label="Class *"
                      options={allClass}
                      disabled={!!editData?.id}
                      value={formik.values.classId || formik.values.class}
                      labelKey="name"
                      valueKey="id"
                      onChange={(val) => {
                        formik.setFieldValue('class', val);
                        formik.setFieldValue('classId', val);
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('subjectId', '');
                      }}
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
                      valueKey="id"
                      multiple
                      disabled={!!editData?.id}
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
                      disabled={
                        !!editData?.id ||
                        !formik.values.divisions ||
                        formik.values.divisions.length === 0
                      }
                      options={
                        subjectOptionsData?.data?.items?.map((item: any) => ({
                          id: item.id,
                          name:
                            item.subjects?.length > 1
                              ? item.electiveGroupName
                              : item.subjects?.[0]?.subject?.name ||
                                item.subjects?.[0]?.subjectName ||
                                '',
                        })) || []
                      }
                      value={formik.values.subjectId}
                      labelKey="name"
                      valueKey="id"
                      isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
                      onChange={(val) => {
                        formik.setFieldValue('subject', val);
                        formik.setFieldValue('subjectId', val);
                        formik.setFieldValue('chapter', '');
                        formik.setFieldValue('chapterId', '');
                      }}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.subjectId && formik.errors.subjectId)}
                      helperText={(formik.touched.subjectId && formik.errors.subjectId) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.chapter && formik.errors.chapter)}>
                    <Autocomplete
                      options={
                        Array.isArray(chapterResponse)
                          ? chapterResponse
                          : chapterResponse?.data?.items || []
                      }
                      disabled={!(formik.values.subjectId || formik.values.subject)}
                      loading={isChapterLoading || isChapterFetching}
                      value={
                        (Array.isArray(chapterResponse)
                          ? chapterResponse
                          : chapterResponse?.data?.items || []
                        ).find(
                          (c: any) => c.id === (formik.values.chapterId || formik.values.chapter)
                        ) || null
                      }
                      onChange={(event, newValue: any) => {
                        formik.setFieldValue(
                          'chapter',
                          newValue?.chapterName || newValue?.name || ''
                        );
                        formik.setFieldValue('chapterId', newValue?.id || '');
                      }}
                      getOptionLabel={(option: any) => option.chapterName || option.name || ''}
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
                      onChange={(e) => {
                        const onlyLetters = e.target.value.replace(/[^A-Za-z0-9&()_\-\s]/g, '');
                        const capitalized = onlyLetters.replace(/\b\w/g, (c) => c.toUpperCase());
                        formik.setFieldValue('title', capitalized);
                      }}
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
                      options={homeworkTypeData?.data || []}
                      labelKey="homeworkTypeName"
                      valueKey="id"
                      isLoading={isHomeworkTypeLoading || isHomeworkTypeFetching}
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
                    value={formik.values.attachments as any}
                    multiple={false}
                    showVisibleDocumentCount={1}
                    onChange={(value) => {
                      const newValue = Array.isArray(value) ? value : value ? [value] : [];
                      formik.setFieldValue('attachments', newValue);
                    }}
                    primaryText="Upload Reference File"
                    secondaryText="Supports PDF, DOCX, IMG (Max 5MB)"
                  />
                </Grid>
              </SectionCard>
            </Grid>

            {/* Schedule Homework Section */}
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
                            p: 1,
                            borderRadius: 1,
                            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
                            border: (theme) => `1px dashed ${theme.palette.divider}`,
                          }}
                        >
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems="center"
                            spacing={2}
                          >
                            <Box sx={{ minWidth: 80 }}>
                              <Chip
                                label={`Div ${allDivision.find((d) => d.id === div.divisionId)?.name || ''}`}
                                color="primary"
                                variant="soft"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                            </Box>

                            <Grid container spacing={1} sx={{ flexGrow: 1 }}>
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
                                    disablePast
                                    value={div.publishDate ? dayjs(div.publishDate) : null}
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
                                    value={div.dueDate ? dayjs(div.dueDate) : null}
                                    onChange={(val) =>
                                      formik.setFieldValue(`divisions[${idx}].dueDate`, val)
                                    }
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
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </SectionCard>
              </Grid>
            )}

            {/* Submission Type */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Submission Type"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    How should students submit this homework?
                  </Typography>
                }
              >
                <Grid size={{ xs: 12 }}>
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
                </Grid>
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
            variant="contained"
            size="small"
            loading={isUpdateLoading || isAddLoading}
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={18}
                height={18}
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
