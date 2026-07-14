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
import { useBoolean } from 'src/hooks/use-boolean';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetHomeworkTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import {
  Box,
  Grid,
  Chip,
  Radio,
  Stack,
  Button,
  Skeleton,
  Checkbox,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
} from '@mui/material';
import {
  useGetSubjectAssignmentsQuery,
  useUploadCurriculumFileMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useAddHomeworkMutation,
  useGetHomeworkByIdQuery,
  useUpdateHomeworkMutation,
  useUpdateHomeworkStatusMutation,
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
      height: '100%',
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
  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [previewFileState, setPreviewFileState] = useState<any>(null);
  const submitModeRef = useRef<'draft' | 'publish' | 'schedule'>('draft');
  const setHomeworkSubmitMode = (mode: 'draft' | 'publish' | 'schedule') => {
    submitModeRef.current = mode;
  };

  const [addHomework, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddHomeworkMutation,
  });
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [updateHomework, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkMutation,
  });
  const [updateHomeworkStatus, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkStatusMutation,
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
  // Composite key for subject dropdown display (handles elective groups: "assignmentId::subjectId")
  const [subjectSelectValue, setSubjectSelectValue] = useState<string>('');
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

        // Check if user is overriding selected template defaults
        const selectedType = activeHomeworkTypes.find((t: any) => t.id === values.homeworkTypeId);
        if (selectedType) {
          let hasOverride = false;
          if (selectedType.defaultSubmissionType !== undefined && selectedType.defaultSubmissionType !== null && selectedType.defaultSubmissionType !== values.submissionType) {
            hasOverride = true;
          }

          if (selectedType.defaultDueDays !== undefined && selectedType.defaultDueDays !== null) {
            const hasDueDaysDiff = values.divisions.some((d: any) => {
              if (!d.publishDate || !d.dueDate) return false;
              const diff = dayjs(d.dueDate).diff(dayjs(d.publishDate), 'day');
              return diff !== selectedType.defaultDueDays;
            });
            if (hasDueDaysDiff) {
              hasOverride = true;
            }
          }

          if (hasOverride) {
            const confirmOverride = window.confirm(
              'Warning: You have modified submission settings or due days from the default homework type template. Are you sure you want to override these settings?'
            );
            if (!confirmOverride) return;
          }
        }

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
          if (values.chapterIds && values.chapterIds.length > 0) {
            values.chapterIds.forEach((id: string) => {
              updateFormData.append('ChapterIds', id);
            });
            updateFormData.append('ChapterId', values.chapterIds[0]);
          } else if (values.chapterId) {
            updateFormData.append('ChapterId', values.chapterId);
            updateFormData.append('ChapterIds', values.chapterId);
          }
          updateFormData.append('Title', values.title);
          if (values.description) updateFormData.append('Description', values.description);
          updateFormData.append('HomeworkTypeId', values.homeworkTypeId);
          updateFormData.append('SubmissionType', values.submissionType.toString());

          if (values.attachments && values.attachments.length > 0) {
            values.attachments.forEach((file: any) => {
              const fileValue = file instanceof File ? file : file.url || file.filePath || file;
              updateFormData.append('attachment', fileValue);
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
          if (values.chapterIds && values.chapterIds.length > 0) {
            values.chapterIds.forEach((id: string) => {
              formData.append('ChapterIds', id);
            });
            formData.append('ChapterId', values.chapterIds[0]);
          } else if (values.chapterId) {
            formData.append('ChapterId', values.chapterId);
            formData.append('ChapterIds', values.chapterId);
          }
          formData.append('Title', values.title);
          if (values.description) formData.append('Description', values.description);
          formData.append('HomeworkTypeId', values.homeworkTypeId);
          formData.append('SubmissionType', values.submissionType.toString());

          if (values.attachments && values.attachments.length > 0) {
            values.attachments.forEach((file: any) => {
              const fileValue = file instanceof File ? file : file.url || file.filePath || file;
              formData.append('attachment', fileValue);
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

          const response = await addHomework({ academicMediumId: medium?.id, body: formData }).unwrap();
          const createdHomeworkId = response?.data?.id || response?.id;
          if (submitModeRef.current === 'publish' && createdHomeworkId) {
            await updateHomeworkStatus({ homeworkId: createdHomeworkId, status: 1 }).unwrap();
          }
          shikshaMitraToast.success({
            message:
              submitModeRef.current === 'publish'
                ? `Homework "${values.title}" has been published successfully.`
                : submitModeRef.current === 'schedule'
                  ? `Homework "${values.title}" has been scheduled successfully.`
                  : `Homework "${values.title}" has been saved as draft.`,
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
    params: {
      standardId: formik.values.classId || formik.values.class,
      subjectId: formik.values.subjectId,
    },
    options: {
      skip: !formik.values.subjectId || !(formik.values.classId || formik.values.class),
    },
  });

  // Initialize subjectSelectValue when editing (resolve composite key from stored subjectId)
  useEffect(() => {
    if (editData?.id && formik.values.subjectId && subjectOptionsData?.data?.items) {
      const { subjectId } = formik.values;
      let selectValue = '';
      subjectOptionsData.data.items.forEach((item: any) => {
        if (item.subjects?.length > 1 && item.electiveGroupName) {
          const matchedSub = item.subjects.find((sub: any) => sub.subjectId === subjectId);
          if (matchedSub) selectValue = `${item.id}::${subjectId}`;
        } else if (item.subjects?.[0]?.subjectId === subjectId) {
          selectValue = `${item.id}::${subjectId}`;
        }
      });
      setSubjectSelectValue(selectValue || subjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, subjectOptionsData?.data?.items, formik.values.subjectId]);

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

  const activeHomeworkTypes = useMemo(() => {
    const list = (homeworkTypeData?.data || []).filter((t: any) => t.status === 0);
    if (editData?.homeworkTypeId) {
      const editType = (homeworkTypeData?.data || []).find((t: any) => t.id === editData.homeworkTypeId);
      if (editType && editType.status === 1) {
        list.push(editType);
      }
    }
    return list;
  }, [homeworkTypeData?.data, editData?.homeworkTypeId]);

  const isLoadingData = isHomeworkLoading || isHomeworkFetching;
  const firstPublishDate = formik.values.divisions?.[0]?.publishDate;
  const shouldSchedule = !!firstPublishDate && dayjs(firstPublishDate).isAfter(dayjs());

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
                title="Academic Details"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Select the class, division, subject, and curriculum context.
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
                        formik.setFieldValue('subject', '');
                        formik.setFieldValue('chapter', '');
                        formik.setFieldValue('chapterId', '');
                        setSubjectSelectValue('');
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
                        const selectedType = activeHomeworkTypes.find(
                          (t: any) => t.id === formik.values.homeworkTypeId
                        );
                        const defaultDueDays = selectedType?.defaultDueDays;

                        const newDivisions = selectedDivs.map((divId) => {
                          const existing = existingDivs.find((d) => d.divisionId === divId);
                          const publishDate = dayjs();
                          return (
                            existing || {
                              divisionId: divId,
                              createdAt: dayjs(),
                              publishDate: publishDate,
                              dueDate: defaultDueDays !== undefined && defaultDueDays !== null ? publishDate.add(defaultDueDays, 'day') : null,
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
                      options={(() => {
                        const allOptions: { value: string; label: string }[] = [];
                        subjectOptionsData?.data?.items?.forEach((item: any) => {
                          if (item.subjects?.length > 1 && item.electiveGroupName) {
                            // Elective group — each subject as its own dropdown entry
                            item.subjects.forEach((sub: any, index: number) => {
                              const subId = sub.subjectId || String(index);
                              allOptions.push({
                                value: `${item.id}::${subId}`,
                                label: sub.subjectName || `${item.electiveGroupName} ${index + 1}`,
                              });
                            });
                          } else {
                            // Regular single subject
                            allOptions.push({
                              value: `${item.id}::${item.subjects?.[0]?.subjectId || item.id}`,
                              label:
                                item.subjects?.[0]?.subject?.name ||
                                item.subjects?.[0]?.subjectName ||
                                '',
                            });
                          }
                        });
                        return allOptions;
                      })()}
                      value={subjectSelectValue}
                      labelKey="label"
                      valueKey="value"
                      isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
                      onChange={(val) => {
                        const strVal = String(val);
                        // Extract the actual subjectId from composite key "assignmentId::subjectId"
                        const resolvedSubjectId = strVal.includes('::')
                          ? strVal.split('::')[1]
                          : strVal;
                        setSubjectSelectValue(strVal);
                        formik.setFieldValue('subjectId', resolvedSubjectId);
                        formik.setFieldValue('subject', resolvedSubjectId);
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
                  <ShakingTextField
                    error={!!(formik.touched.chapterIds && formik.errors.chapterIds)}
                  >
                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={
                        Array.isArray(chapterResponse)
                           ? chapterResponse
                           : chapterResponse?.data?.items || []
                      }
                      disabled={!(formik.values.subjectId || formik.values.subject)}
                      loading={isChapterLoading || isChapterFetching}
                      value={(Array.isArray(chapterResponse)
                        ? chapterResponse
                        : chapterResponse?.data?.items || []
                      ).filter((c: any) => formik.values.chapterIds?.includes(c.id))}
                      onChange={(event, newValue: any[]) => {
                        const selectedIds = newValue.map((c: any) => c.id);
                        formik.setFieldValue('chapterIds', selectedIds);
                        formik.setFieldValue('chapterId', selectedIds[0] || '');
                        formik.setFieldValue(
                          'chapter',
                          newValue.map((c: any) => c.chapterName || c.name || '').join(', ')
                        );
                      }}
                      getOptionLabel={(option: any) => {
                        const no = option.chapterNumber ?? option.chapterNo;
                        const name = option.chapterName || option.name || '';
                        return no !== undefined && no !== null ? `Ch ${no} - ${name}` : name;
                      }}
                      isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                      renderOption={(props, option: any, { selected }) => {
                        const no = option.chapterNumber ?? option.chapterNo;
                        const name = option.chapterName || option.name || '';
                        const displayText =
                          no !== undefined && no !== null ? `Ch ${no} - ${name}` : name;
                        return (
                          <li {...props}>
                            <Checkbox
                              icon={<Iconify icon="mdi:checkbox-blank-outline" />}
                              checkedIcon={<Iconify icon="mdi:checkbox-marked" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {displayText}
                          </li>
                        );
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Chapter"
                          error={formik.touched.chapterIds && Boolean(formik.errors.chapterIds)}
                          helperText={
                            (formik.touched.chapterIds && formik.errors.chapterIds) as string
                          }
                          size="small"
                          fullWidth
                        />
                      )}
                      slotProps={{
                        chip: {
                          size: 'small',
                          variant: 'soft',
                        },
                      }}
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
                      options={activeHomeworkTypes}
                      labelKey="homeworkTypeName"
                      valueKey="id"
                      isLoading={isHomeworkTypeLoading || isHomeworkTypeFetching}
                      value={formik.values.homeworkTypeId || ''}
                      onChange={(val) => {
                        formik.setFieldValue('homeworkTypeId', val);
                        const selectedType = activeHomeworkTypes.find((t: any) => t.id === val);
                        if (selectedType) {
                          if (selectedType.defaultSubmissionType !== undefined && selectedType.defaultSubmissionType !== null) {
                            formik.setFieldValue('submissionType', selectedType.defaultSubmissionType);
                          }
                          if (selectedType.defaultDueDays !== undefined && selectedType.defaultDueDays !== null) {
                            const newDivisions = formik.values.divisions.map((d: any) => {
                              const pubDate = d.publishDate ? dayjs(d.publishDate) : dayjs();
                              return {
                                ...d,
                                dueDate: pubDate.add(selectedType.defaultDueDays, 'day'),
                              };
                            });
                            formik.setFieldValue('divisions', newDivisions);
                          }
                        }
                      }}
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
                    hasForm={false}
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
                title="Instructions & Attachments *"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Provide clear instructions and upload reference files.
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
                    onChange={async (value) => {
                      const file = Array.isArray(value) ? value[0] : value;
                      if (file instanceof File) {
                        try {
                          const formData = new FormData();
                          formData.append('FileName', file.name);
                          formData.append('File', file);
                          const response = await uploadCurriculumFile(formData).unwrap();
                          if (response.data) {
                            const uploadedFile = {
                              name: file.name,
                              size: file.size,
                              type: file.type,
                              url: response.data,
                            };
                            formik.setFieldValue('attachments', [uploadedFile]);
                            shikshaMitraToast.success({ message: 'File uploaded successfully' });
                          }
                        } catch (e) {
                          console.error(e);
                          shikshaMitraToast.error({ message: 'Upload failed' });
                        }
                      } else if (file) {
                        formik.setFieldValue('attachments', [file]);
                      } else {
                        formik.setFieldValue('attachments', []);
                      }
                    }}
                    onPreview={(file) => {
                      setPreviewFileState(file);
                      const url =
                        file instanceof File
                          ? URL.createObjectURL(file)
                          : file.url || file.filePath || '';
                      setPreviewDoc(url);
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
                title="Publish Settings"
                  paperProps={{ sx: cardStyle }}
                  headerContent={
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Save as draft, publish now, or schedule visibility by division.
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
                                      const selectedType = activeHomeworkTypes.find(
                                        (t: any) => t.id === formik.values.homeworkTypeId
                                      );
                                      if (
                                        val &&
                                        selectedType?.defaultDueDays !== undefined &&
                                        selectedType.defaultDueDays !== null
                                      ) {
                                        formik.setFieldValue(
                                          `divisions[${idx}].dueDate`,
                                          dayjs(val).add(selectedType.defaultDueDays, 'day')
                                        );
                                      }
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
                title="Submission Settings"
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
                    <Grid container spacing={2} alignItems="stretch">
                      {[
                        { value: 0, label: 'Online Text' },
                        { value: 1, label: 'File Upload' },
                        { value: 2, label: 'In-Person' },
                        { value: 3, label: 'No Submission Required' },
                      ].map((item) => (
                        <Grid size={{ xs: 12, md: 3 }} key={item.value} sx={{ display: 'flex' }}>
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
              setHomeworkSubmitMode('draft');
              formik.handleSubmit(e);
            }}
            type="submit"
          >
            {editData ? 'Update Draft' : 'Save Draft'}
          </LoadingButton>
          {!editData && (
            <LoadingButton
              variant="contained"
              size="small"
              loading={isUpdateLoading || isAddLoading || isPublishLoading}
              startIcon={<Iconify icon={shouldSchedule ? 'solar:calendar-mark-bold' : 'solar:upload-bold'} />}
              onClick={(e: any) => {
                setHomeworkSubmitMode(shouldSchedule ? 'schedule' : 'publish');
                formik.handleSubmit(e);
              }}
            >
              {shouldSchedule ? 'Schedule Publish' : 'Publish Now'}
            </LoadingButton>
          )}
          <DocumentPreviewDialog
            open={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            url={previewDoc || ''}
            documentName={previewFileState ? previewFileState.name : 'Document Preview'}
          />
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
