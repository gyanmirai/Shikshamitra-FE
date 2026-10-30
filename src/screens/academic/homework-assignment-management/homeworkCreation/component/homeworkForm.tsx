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
import { Scrollbar } from 'src/components/scrollbar';
import { DayType } from 'src/enums/academic-calendar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { learningTaskNow, LEARNING_TASK_TIME_ZONE } from 'src/utils/learning-task-date-time';
import { AcademicDateTimePicker as DateTimePicker } from 'src/components/academic-date-picker';
import { useGetHomeworkTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { useGetChapterLookupQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Button,
  Skeleton,
  Checkbox,
  TextField,
  FormLabel,
  Typography,
  FormControl,
  Autocomplete,
} from '@mui/material';
import {
  RubricStatus,
  RubricWorkType,
  useGetRubricsQuery,
  useCreateRubricFromTemplateMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/RubricAssessmentApi';
import {
  useAddHomeworkMutation,
  useGetHomeworkByIdQuery,
  useUpdateHomeworkMutation,
  useUpdateHomeworkStatusMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';

import { getHomeworkInitialValues } from './homeworkInitialValues';
import { serializeHomeworkFormData } from './homework-serialization';
import { homeworkValidationSchema } from './homeworkValidationSchema';
import { SubmissionTypeCard } from '../../components/SubmissionTypeCard';
import { ReferenceFileUpload } from '../../components/ReferenceFileUpload';
import HomeworkTypeForm from '../../setting/homeworkType/homeworkTypeForm';
import { useReferenceFileUpload } from '../../hooks/useReferenceFileUpload';
import { useHomeworkRubricTemplateSelection } from '../hooks/useHomeworkRubricTemplateSelection';
import { LearningTaskFormSection as SectionCard } from '../../components/LearningTaskFormSection';

import type { IHomeWorkCreationFormProps } from '../type';

const homeworkDueBlockedDayTypes = [DayType.Holiday, DayType.Vacation, DayType.EmergencyClosure];
// Tall calendar/time popups must remain inside the viewport when neither side of the field fits.
const homeworkSchedulePopper = {
  placement: 'top-start' as const,
  modifiers: [{ name: 'preventOverflow', options: { altAxis: true, tether: false, padding: 8 } }],
  sx: { zIndex: 1300 },
};

export const cardStyle = {
  p: { xs: 1.5, sm: 2 },
  borderRadius: 2,
  border: 1,
  borderColor: 'divider',
  bgcolor: 'background.paper',
};

const HomeworkForm: React.FC<IHomeWorkCreationFormProps> = ({
  classes,
  subject,
  dialog,
  editData,
  onClose,
}) => {
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [previewFileState, setPreviewFileState] = useState<any>(null);
  const [createRubricFromTemplate] = useCreateRubricFromTemplateMutation();
  const submitModeRef = useRef<'draft' | 'publish' | 'schedule'>('draft');
  const activeSubmitModeRef = useRef<'draft' | 'publish' | 'schedule' | null>(null);
  const [activeSubmitMode, setActiveSubmitMode] = useState<'draft' | 'publish' | 'schedule' | null>(
    null
  );
  const overrideDialog = useBoolean();
  const resolveOverrideRef = useRef<((confirmed: boolean) => void) | null>(null);
  const resolveOverride = (confirmed: boolean) => {
    overrideDialog.onFalse();
    resolveOverrideRef.current?.(confirmed);
    resolveOverrideRef.current = null;
  };
  const setHomeworkSubmitMode = (mode: 'draft' | 'publish' | 'schedule') => {
    submitModeRef.current = mode;
  };

  useEffect(() => {
    // A reopened form must never inherit a previous Publish Now selection.
    submitModeRef.current = 'draft';
  }, [editData?.id]);

  const [addHomework] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddHomeworkMutation,
    popupConfig: { error: false },
  });
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [updateHomework] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkMutation,
    popupConfig: { error: false },
  });
  const [updateHomeworkStatus] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkStatusMutation,
    popupConfig: { error: false },
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

  const { data: homeworkRubrics, isFetching: isHomeworkRubricFetching } = useGetRubricsQuery(
    {
      homeworkId: editData?.id,
      isTemplate: false,
      status: RubricStatus.Published,
    },
    {
      skip: !editData?.id,
    }
  );
  const { assignedRubricTemplateId, selectedRubricTemplateId, setSelectedRubricTemplateId } =
    useHomeworkRubricTemplateSelection(editData?.id, homeworkRubrics);

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
      if (referenceUpload.isBlocked()) return;
      try {
        const activeClassId = values.classId || values.class;

        const selectedType = activeHomeworkTypes.find((t: any) => t.id === values.homeworkTypeId);
        const submissionChanged =
          selectedType?.defaultSubmissionType !== undefined &&
          selectedType.defaultSubmissionType !== null &&
          selectedType.defaultSubmissionType !== values.submissionType;
        const dueDaysChanged =
          selectedType?.defaultDueDays !== undefined &&
          selectedType.defaultDueDays !== null &&
          values.divisions.some((division) => {
            if (!division.publishDate || !division.dueDate) return false;
            return (
              dayjs(division.dueDate).diff(dayjs(division.publishDate), 'day') !==
              selectedType.defaultDueDays
            );
          });

        if (submissionChanged || dueDaysChanged) {
          const confirmed = await new Promise<boolean>((resolve) => {
            resolveOverrideRef.current = resolve;
            overrideDialog.onTrue();
          });
          if (!confirmed) return;
        }

        if (editData) {
          const updatePayload = {
            id: editData.id,
            body: serializeHomeworkFormData({
              ...values,
              standardId: values.standardId || activeClassId,
              subjectId: values.subjectId || values.subject,
            }),
          };
          await updateHomework(updatePayload).unwrap();
          if (selectedRubricTemplateId && selectedRubricTemplateId !== assignedRubricTemplateId) {
            await createRubricFromTemplate({
              templateId: selectedRubricTemplateId,
              body: {
                standardId:
                  values.classId || values.standardId || values.class || activeClassId || '',
                subjectId: values.subjectId || values.subject,
                homeworkId: editData.id,
                title: `${values.title} Rubric`,
              },
            }).unwrap();
          }
          shikshaMitraToast.success({
            message: `Homework "${values.title}" has been updated successfully.`,
          });
        } else {
          const formData = serializeHomeworkFormData({
            ...values,
            standardId: values.standardId || activeClassId,
            subjectId: values.subjectId || values.subject,
          });

          const response = await addHomework({
            academicMediumId: medium?.id,
            body: formData,
          }).unwrap();
          const createdHomeworkId = response?.data?.id || response?.id;
          if (selectedRubricTemplateId && createdHomeworkId) {
            await createRubricFromTemplate({
              templateId: selectedRubricTemplateId,
              body: {
                standardId:
                  values.classId || values.standardId || values.class || activeClassId || '',
                subjectId: values.subjectId || values.subject,
                homeworkId: createdHomeworkId,
                title: `${values.title} Rubric`,
              },
            }).unwrap();
          }
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
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to save homework.',
        });
      }
    },
  });

  const referenceUpload = useReferenceFileUpload(async (file) => {
    await formik.setFieldValue('attachments', file ? [file] : []);
  }, formik.isSubmitting);

  const submitHomework = async (mode: 'draft' | 'publish' | 'schedule') => {
    if (activeSubmitModeRef.current) return;
    activeSubmitModeRef.current = mode;
    setActiveSubmitMode(mode);
    setHomeworkSubmitMode(mode);
    try {
      await formik.submitForm();
    } finally {
      activeSubmitModeRef.current = null;
      setActiveSubmitMode(null);
    }
  };

  const divisionSelectionError =
    formik.touched.divisions &&
    formik.values.divisions.length === 0 &&
    typeof formik.errors.divisions === 'string'
      ? formik.errors.divisions
      : undefined;

  const { data: rubricTemplates = [], isFetching: isRubricTemplateFetching } = useGetRubricsQuery(
    {
      academicMediumId: medium?.id,
      homeworkTypeId: formik.values.homeworkTypeId || undefined,
      isTemplate: true,
      appliesToWorkType: RubricWorkType.Homework,
      status: RubricStatus.Published,
    },
    {
      skip: !medium?.id,
    }
  );

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
      status: SubjectAssignmentStatus.Published,
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
    currentQueryAndMutation: useGetChapterLookupQuery,
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
    params: { academicMediumId: (medium as Medium)?.id, includeArchived: false },
    options: {
      skip: !(medium as Medium)?.id,
      refetchOnMountOrArgChange: 60,
    },
  });

  const activeHomeworkTypes = useMemo(() => {
    const list = (homeworkTypeData?.data || []).filter((t: any) => t.status === 0);
    if (editData?.homeworkTypeId) {
      const editType = (homeworkTypeData?.data || []).find(
        (t: any) => t.id === editData.homeworkTypeId
      );
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
                <Grid container spacing={1}>
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
                <Grid container spacing={1}>
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
            gap: 1,
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
          <Grid container spacing={2}>
            {/* Basic Details Section */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Academic Details"
                icon={GlobalIcons.notebook}
                description="Select the class, division, subject and curriculum context."
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
                  <ShakingTextField error={!!divisionSelectionError}>
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
                          const publishDate = learningTaskNow();
                          return (
                            existing || {
                              divisionId: divId,
                              createdAt: dayjs(),
                              publishDate,
                              dueDate:
                                defaultDueDays !== undefined && defaultDueDays !== null
                                  ? publishDate.add(defaultDueDays, 'day')
                                  : null,
                            }
                          );
                        });

                        formik.setFieldValue('divisions', newDivisions);
                      }}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={!!divisionSelectionError}
                      helperText={divisionSelectionError}
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
                    <LanguageInputField
                      fullWidth
                      label="Homework title *"
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
                      label="Homework type *"
                      options={activeHomeworkTypes}
                      labelKey="homeworkTypeName"
                      valueKey="id"
                      isLoading={isHomeworkTypeLoading || isHomeworkTypeFetching}
                      value={formik.values.homeworkTypeId || ''}
                      onChange={(val) => {
                        formik.setFieldValue('homeworkTypeId', val);
                        setSelectedRubricTemplateId('');
                        const selectedType = activeHomeworkTypes.find((t: any) => t.id === val);
                        if (selectedType) {
                          if (
                            selectedType.defaultSubmissionType !== undefined &&
                            selectedType.defaultSubmissionType !== null
                          ) {
                            formik.setFieldValue(
                              'submissionType',
                              selectedType.defaultSubmissionType
                            );
                          }
                          if (
                            selectedType.defaultDueDays !== undefined &&
                            selectedType.defaultDueDays !== null
                          ) {
                            const newDivisions = formik.values.divisions.map((d: any) => {
                              const pubDate = d.publishDate ? dayjs(d.publishDate) : learningTaskNow();
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    label="Rubric template"
                    options={rubricTemplates}
                    labelKey="title"
                    valueKey="id"
                    value={selectedRubricTemplateId}
                    isLoading={isRubricTemplateFetching || isHomeworkRubricFetching}
                    onChange={(value) => setSelectedRubricTemplateId(String(value))}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </Grid>
              </SectionCard>
            </Grid>

            {/* Description Section */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Instructions & Attachments"
                icon={GlobalIcons.documentIcon}
                description="Provide clear task instructions and any reference files."
              >
                <Grid size={{ xs: 12 }}>
                  <ShakingTextField
                    error={!!(formik.touched.description && formik.errors.description)}
                  >
                    <FormLabel
                      component="div"
                      id="homework-instructions-label"
                      required
                      error={!!(formik.touched.description && formik.errors.description)}
                      sx={{ display: 'block', mb: 1, typography: 'body2' }}
                    >
                      Task instructions
                    </FormLabel>
                    <Editor
                      editorProps={{
                        attributes: {
                          'aria-label': 'Task instructions',
                          'aria-labelledby': 'homework-instructions-label',
                          'aria-required': 'true',
                        },
                      }}
                      value={formik.values.description}
                      onChange={(value) => formik.setFieldValue('description', value)}
                      placeholder="Write a clear description..."
                      error={!!(formik.touched.description && formik.errors.description)}
                      helperText={(formik.touched.description && formik.errors.description) || ''}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ReferenceFileUpload
                    value={formik.values.attachments?.[0]}
                    upload={referenceUpload}
                    disabled={formik.isSubmitting}
                    onPreview={(file) => {
                      setPreviewFileState(file);
                      const url =
                        file instanceof File
                          ? URL.createObjectURL(file)
                          : file.url || file.filePath || '';
                      setPreviewDoc(url);
                    }}
                  />
                </Grid>
              </SectionCard>
            </Grid>

            {/* Schedule Homework Section */}
            {formik.values.divisions.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Publish Settings"
                  icon={GlobalIcons.calendar}
                  description="Save as draft, publish now, or schedule visibility by division."
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
                            spacing={1}
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
                                    (!!formik.touched.divisions?.[idx]?.publishDate ||
                                      formik.submitCount > 0)
                                  }
                                >
                                  <DateTimePicker
                                    label="Publish date (IST) *"
                                    timezone={LEARNING_TASK_TIME_ZONE}
                                    academicMediumId={medium?.id}
                                    standardId={formik.values.classId || formik.values.class}
                                    divisionId={div.divisionId}
                                    blockedDayTypes={[]}
                                    format="DD/MM/YYYY HH:mm"
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
                                    helperText={
                                      typeof formik.errors.divisions?.[idx] === 'object' &&
                                      (formik.errors.divisions?.[idx] as any)?.publishDate &&
                                      (!!formik.touched.divisions?.[idx]?.publishDate ||
                                        formik.submitCount > 0)
                                        ? (formik.errors.divisions?.[idx] as any)?.publishDate
                                        : 'When to show this homework to students'
                                    }
                                    slotProps={{
                                      popper: homeworkSchedulePopper,
                                      textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        error:
                                          typeof formik.errors.divisions?.[idx] === 'object' &&
                                          !!(formik.errors.divisions?.[idx] as any)?.publishDate &&
                                          (!!formik.touched.divisions?.[idx]?.publishDate ||
                                            formik.submitCount > 0),
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
                                    (!!formik.touched.divisions?.[idx]?.dueDate ||
                                      formik.submitCount > 0)
                                  }
                                >
                                  <DateTimePicker
                                    label="Due date (IST) *"
                                    timezone={LEARNING_TASK_TIME_ZONE}
                                    academicMediumId={medium?.id}
                                    standardId={formik.values.classId || formik.values.class}
                                    divisionId={div.divisionId}
                                    blockedDayTypes={homeworkDueBlockedDayTypes}
                                    format="DD/MM/YYYY HH:mm"
                                    minDate={dayjs(currentYear?.startDate)}
                                    maxDate={dayjs(currentYear?.endDate)}
                                    value={div.dueDate ? dayjs(div.dueDate) : null}
                                    onChange={(val) =>
                                      formik.setFieldValue(`divisions[${idx}].dueDate`, val)
                                    }
                                    disabled={!div.publishDate}
                                    ampm={false}
                                    helperText={
                                      typeof formik.errors.divisions?.[idx] === 'object' &&
                                      (formik.errors.divisions?.[idx] as any)?.dueDate &&
                                      (!!formik.touched.divisions?.[idx]?.dueDate ||
                                        formik.submitCount > 0)
                                        ? (formik.errors.divisions?.[idx] as any)?.dueDate
                                        : 'Must be after the publish date'
                                    }
                                    slotProps={{
                                      popper: homeworkSchedulePopper,
                                      textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        error:
                                          typeof formik.errors.divisions?.[idx] === 'object' &&
                                          !!(formik.errors.divisions?.[idx] as any)?.dueDate &&
                                          (!!formik.touched.divisions?.[idx]?.dueDate ||
                                            formik.submitCount > 0),
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
                icon={GlobalIcons.upload}
                description="Choose how students submit this homework."
              >
                <Grid size={{ xs: 12 }}>
                  <FormControl
                    component="fieldset"
                    error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                    fullWidth
                  >
                    <Grid container spacing={1} alignItems="stretch">
                      {[
                        {
                          value: 0,
                          label: 'Online Text',
                          description: 'Type response directly in the text editor.',
                          icon: 'solar:keyboard-bold-duotone',
                        },
                        {
                          value: 1,
                          label: 'File Upload',
                          description: 'Submit PDFs, documents, or images.',
                          icon: 'solar:file-send-bold-duotone',
                        },
                        {
                          value: 2,
                          label: 'In-Person',
                          description: 'Turn in physically in class.',
                          icon: 'solar:users-group-two-rounded-bold-duotone',
                        },
                        {
                          value: 3,
                          label: 'No Submission',
                          description: 'For reading or verbal homework tasks.',
                          icon: 'solar:verified-check-bold-duotone',
                        },
                      ].map((item) => (
                        <Grid
                          size={{ xs: 12, sm: 6, md: 3 }}
                          key={item.value}
                          sx={{ display: 'flex' }}
                        >
                          <SubmissionTypeCard
                            value={item.value}
                            label={item.label}
                            description={item.description}
                            icon={item.icon}
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
            alignItems: 'center',
            flexWrap: 'wrap',
            flexShrink: 0,
            justifyContent: 'flex-end',
            gap: 1,
            borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            '& > .MuiButton-root': { whiteSpace: 'nowrap', flexShrink: 0 },
          }}
        >
          <Button
            type="button"
            variant="outlined"
            disabled={activeSubmitMode !== null}
            onClick={() => onClose(null, false)}
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
          >
            Cancel
          </Button>
          <LoadingButton
            disabled={
              (activeSubmitMode !== null && activeSubmitMode !== 'draft') ||
              referenceUpload.isUploading ||
              Boolean(referenceUpload.error)
            }
            type="button"
            variant="contained"
            size="small"
            loading={activeSubmitMode === 'draft'}
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={18}
                height={18}
              />
            }
            onClick={() => submitHomework('draft')}
          >
            {editData ? 'Update draft' : 'Save draft'}
          </LoadingButton>
          {!editData && (
            <LoadingButton
              disabled={
                activeSubmitMode === 'draft' ||
                referenceUpload.isUploading ||
                Boolean(referenceUpload.error)
              }
              type="button"
              variant="contained"
              size="small"
              loading={activeSubmitMode === 'publish' || activeSubmitMode === 'schedule'}
              startIcon={
                <Iconify icon={shouldSchedule ? 'solar:calendar-mark-bold' : 'solar:upload-bold'} />
              }
              onClick={() => submitHomework(shouldSchedule ? 'schedule' : 'publish')}
            >
              {shouldSchedule ? 'Schedule publish' : 'Publish now'}
            </LoadingButton>
          )}
          <DocumentPreviewDialog
            open={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            url={previewDoc || ''}
            documentName={previewFileState ? previewFileState.name : 'Document Preview'}
          />
          <ConfirmDialog
            open={overrideDialog.value}
            disableBackdropClick
            onClose={() => resolveOverride(false)}
            icon="warning"
            title={
              submitModeRef.current === 'publish'
                ? 'Publish homework with your settings?'
                : submitModeRef.current === 'schedule'
                  ? 'Schedule homework with your settings?'
                  : 'Save homework with your settings?'
            }
            content="The due date or submission method differs from the homework type defaults. Your selected values will be used for this homework."
            cancelText="Keep editing"
            action={
              <Button
                type="button"
                variant="contained"
                color="warning"
                size="small"
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                onClick={() => resolveOverride(true)}
              >
                {submitModeRef.current === 'publish'
                  ? 'Publish homework'
                  : submitModeRef.current === 'schedule'
                    ? 'Schedule homework'
                    : 'Save homework'}
              </Button>
            }
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
//     <Grid container spacing={1}>
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
