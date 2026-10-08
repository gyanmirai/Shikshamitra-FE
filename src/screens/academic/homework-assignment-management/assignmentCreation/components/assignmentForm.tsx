'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';
import type { AssignmentTypeDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';

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
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { AcademicDateTimePicker as DateTimePicker } from 'src/components/academic-date-picker';
import { useGetAssignmentTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { serializeAssignmentFormData } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-serialization';
import { useGetChaptersByStandardQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/Chapter-management-api';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  AssignmentStatus,
  evaluationUsesMarks,
  AssignmentEvaluationMethod,
  ASSIGNMENT_EVALUATION_METHOD_OPTIONS,
} from 'src/enums/assignment';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Button,
  Checkbox,
  Skeleton,
  TextField,
  IconButton,
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
  useAddAssignmentMutation,
  useGetAssignmentByIdQuery,
  useUpdateAssignmentMutation,
  useUpdateAssignmentStatusMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';

import { SubmissionTypeCard } from '../../components/SubmissionTypeCard';
import { ReferenceFileUpload } from '../../components/ReferenceFileUpload';
import { useReferenceFileUpload } from '../../hooks/useReferenceFileUpload';
import {
  getAssignmentInitialValues,
  hasAssignmentTypeOverrides,
  assignmentValidationSchema,
  applyAssignmentTypeDefaults,
} from './assignmentFormData';

import type { IAssignmentFormProps } from '../type';
import type { AssignmentFormValues } from './assignmentFormData';

const cardStyle = {
  p: 2,
  borderRadius: 2,
  boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
  border: '1px solid rgba(145, 158, 171, 0.08)',
};

const AssignmentForm: React.FC<IAssignmentFormProps> = ({ classes, editData, onClose }) => {
  // State to control assignment type dialog visibility
  const { currentYear, currentMedium: medium } = useSelector(
    (state: RootState) => state.globalState
  );

  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [subjectSelectValue, setSubjectSelectValue] = useState('');
  const typeDefaultsDialog = useBoolean();
  const overrideDialog = useBoolean();
  const [pendingAssignmentTypeId, setPendingAssignmentTypeId] = useState<string | null>(null);
  const [pendingSubmitValues, setPendingSubmitValues] = useState<AssignmentFormValues | null>(null);
  const submitModeRef = useRef<'draft' | 'publish' | 'schedule'>('draft');
  const activeSubmitModeRef = useRef<'draft' | 'publish' | 'schedule' | null>(null);
  const pendingOverrideRef = useRef(false);
  const [activeSubmitMode, setActiveSubmitMode] = useState<'draft' | 'publish' | 'schedule' | null>(
    null
  );
  const finishSubmission = () => {
    activeSubmitModeRef.current = null;
    setActiveSubmitMode(null);
  };

  useEffect(() => {
    // A reopened form must never inherit a previous Publish Now selection.
    submitModeRef.current = 'draft';
  }, [editData?.id]);

  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [previewFileState, setPreviewFileState] = useState<any>(null);

  const getFileNameFromUrl = (file: string | File): string => {
    if (!file) return '';
    if (typeof file !== 'string') return file.name;
    return decodeURIComponent(file.split('?')[0].split('/').filter(Boolean).pop() || 'Attachment');
  };

  const [addAssignment] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAssignmentMutation,
  });

  const [updateAssignment] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentMutation,
  });
  const [updateAssignmentStatus] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentStatusMutation,
  });
  const [createRubricFromTemplate] = useCreateRubricFromTemplateMutation();

  const {
    data: assignmentByIdData,
    isLoading: isAssignmentByIdLoading,
    isFetching: isAssignmentByIdFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentByIdQuery,
    params: { assignmentId: editData?.id, academicMediumId: medium?.id },
    options: { skip: !editData?.id || !medium?.id },
  });

  // Update classes when organization changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
  }, [classes, medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
  }, [allClass, classes]);

  const {
    data: assignmentTypeData,
    isLoading: isAssignmentTypeLoading,
    isFetching: isAssignmentTypeFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentTypesQuery,
    params: { academicMediumId: (medium as Medium)?.id, includeArchived: false },
    options: { skip: !(medium as Medium)?.id },
  });

  /**
   * Memoization Justification:
   * - Assignment type options are filtered from query data and preserve an inactive edit value.
   * - CustomSelect receives the derived array and otherwise reprocesses options every form render.
   */
  const activeAssignmentTypes = useMemo(() => {
    const assignmentTypes: AssignmentTypeDto[] = assignmentTypeData?.data ?? [];
    const list = assignmentTypes.filter((assignmentType) => assignmentType.status === 0);
    if (editData?.assignmentTypeId) {
      const editType = assignmentTypes.find(
        (assignmentType) => assignmentType.id === editData.assignmentTypeId
      );
      if (editType?.status === 1) list.push(editType);
    }
    return list;
  }, [assignmentTypeData?.data, editData?.assignmentTypeId]);

  /**
   * Memoization Justification:
   * - Formik compares the complete initial object while assignment detail is loading.
   * - It prevents unnecessary reinitialization until the detail, class, or academic year changes.
   */
  const assignmentInitialValues = useMemo(
    () =>
      getAssignmentInitialValues(
        assignmentByIdData?.data ?? editData,
        classes,
        currentYear?.id ?? ''
      ),
    [assignmentByIdData?.data, classes, currentYear?.id, editData]
  );

  const saveAssignment = async (values: AssignmentFormValues) => {
    if (referenceUpload.isBlocked()) return;
    if (!medium?.id) {
      shikshaMitraToast.error({ message: 'Select an academic medium before saving.' });
      return;
    }

    try {
      const body = serializeAssignmentFormData(values);
      if (editData) {
        await updateAssignment({
          assignmentId: editData.id,
          academicMediumId: medium.id,
          body,
        }).unwrap();
        shikshaMitraToast.success({
          message: `Assignment "${values.title.trim()}" has been updated successfully.`,
        });
        onClose(null, true);
        return;
      }

      const response = await addAssignment({ academicMediumId: medium.id, body }).unwrap();
      const createdAssignmentId = response.data.id;

      if (
        values.evaluationMethod === AssignmentEvaluationMethod.Rubric &&
        values.rubricTemplateId
      ) {
        try {
          await createRubricFromTemplate({
            templateId: values.rubricTemplateId,
            body: {
              standardId: values.classId,
              subjectId: values.subjectId,
              assignmentId: createdAssignmentId,
              title: `${values.title.trim()} Rubric`,
            },
          }).unwrap();
        } catch (error: unknown) {
          shikshaMitraToast.error({
            message: `Assignment saved, but rubric copy failed: ${parseApiProblemDetail(error).detail}`,
          });
        }
      }

      if (submitModeRef.current === 'publish') {
        await updateAssignmentStatus({
          assignmentId: createdAssignmentId,
          status: AssignmentStatus.Published,
        }).unwrap();
      }

      shikshaMitraToast.success({
        message:
          submitModeRef.current === 'publish'
            ? `Assignment "${values.title.trim()}" has been published successfully.`
            : submitModeRef.current === 'schedule'
              ? `Assignment "${values.title.trim()}" has been scheduled successfully.`
              : `Assignment "${values.title.trim()}" has been saved as draft.`,
      });

      onClose(null, true);
    } catch (error: unknown) {
      shikshaMitraToast.error({
        message: parseApiProblemDetail(error).detail || 'Failed to save assignment.',
      });
    }
  };

  const formik = useFormik({
    initialValues: assignmentInitialValues,
    enableReinitialize: true,
    validationSchema: assignmentValidationSchema(currentYear, Boolean(editData)),
    onSubmit: async (values) => {
      if (referenceUpload.isBlocked()) return;
      const selectedType = activeAssignmentTypes.find(
        (assignmentType) => assignmentType.id === values.assignmentTypeId
      );
      if (hasAssignmentTypeOverrides(values, selectedType)) {
        pendingOverrideRef.current = true;
        setPendingSubmitValues(values);
        overrideDialog.onTrue();
        return;
      }

      await saveAssignment(values);
    },
  });

  const referenceUpload = useReferenceFileUpload(
    async (file) => {
      await formik.setFieldValue('attachment', file);
      await formik.setFieldValue('removeAttachment', !file && Boolean(editData?.attachment));
    },
    formik.isSubmitting
  );

  const submitAssignment = (mode: 'draft' | 'publish' | 'schedule') => {
    if (activeSubmitModeRef.current) return;
    activeSubmitModeRef.current = mode;
    setActiveSubmitMode(mode);
    submitModeRef.current = mode;
    void formik.submitForm().finally(() => {
      if (!pendingOverrideRef.current) finishSubmission();
    });
  };

  const divisionSelectionError =
    formik.touched.divisions &&
    formik.values.divisions.length === 0 &&
    typeof formik.errors.divisions === 'string'
      ? formik.errors.divisions
      : undefined;

  const firstPublishDate = formik.values.divisions?.[0]?.publishDate;
  const shouldSchedule = !!firstPublishDate && dayjs(firstPublishDate).isAfter(dayjs());

  // Update divisions when class changes in form
  useEffect(() => {
    const activeClassId = formik.values.classId;
    setAllDivision(allClass.find((org: any) => org?.id === activeClassId)?.divisions || []);
  }, [allClass, formik.values.classId]);

  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: formik.values.classId, status: SubjectAssignmentStatus.Published },
    options: { skip: !formik.values.classId },
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
    data: chapterResponse,
    isLoading: isChapterLoading,
    isFetching: isChapterFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChaptersByStandardQuery,
    params: { standardId: formik.values.classId, subjectId: formik.values.subjectId },
    options: { skip: !formik.values.classId || !formik.values.subjectId },
  });

  const isLoadingData = isAssignmentByIdLoading || isAssignmentByIdFetching;

  const usesMarks = evaluationUsesMarks(
    formik.values.evaluationRequired,
    formik.values.evaluationMethod
  );
  const usesRubric =
    formik.values.evaluationRequired &&
    formik.values.evaluationMethod === AssignmentEvaluationMethod.Rubric;

  const { data: rubricTemplates = [], isFetching: isRubricTemplateFetching } = useGetRubricsQuery(
    {
      academicMediumId: medium?.id,
      assignmentTypeId: formik.values.assignmentTypeId || undefined,
      isTemplate: true,
      appliesToWorkType: RubricWorkType.Assignment,
      status: RubricStatus.Published,
    },
    {
      skip: !medium?.id || !usesRubric || Boolean(editData?.id),
    }
  );

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
            {/* Basic Details Skeleton */}
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

            {/* Schedule & Deadlines Skeleton */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ ...cardStyle, mb: 2 }}>
                <Skeleton variant="text" width={200} height={28} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={280} height={20} sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  {[...Array(4)].map((_, i) => (
                    <Grid size={{ xs: 12, md: 6 }} key={i}>
                      <Skeleton variant="rounded" height={40} />
                    </Grid>
                  ))}
                </Grid>
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
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container>
            {/* Basic Details Section */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Basic Details"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Box sx={{ flex: 1, ml: 0.5 }}>
                    <CustomTooltip
                      title="Define the core details of the assignment"
                      placement="right"
                      arrow
                    >
                      <IconButton size="small" aria-label="About basic details" sx={{ p: 0.25 }}>
                        <Iconify icon="lucide:info" width={18} color="info.main" />
                      </IconButton>
                    </CustomTooltip>
                  </Box>
                }
              >
                {/* Class */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.classId && formik.errors.classId)}>
                    <CustomSelect
                      label="Class *"
                      options={allClass}
                      value={formik.values.classId}
                      disabled={!!editData?.id}
                      labelKey="name"
                      valueKey="id"
                      onChange={(val) => {
                        formik.setFieldValue('classId', val);
                        formik.setFieldValue('subjectId', '');
                        formik.setFieldValue('divisions', []);
                        setSubjectSelectValue('');
                      }}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={!!(formik.touched.classId && formik.errors.classId)}
                      helperText={
                        formik.touched.classId && typeof formik.errors.classId === 'string'
                          ? formik.errors.classId
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* Division */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!divisionSelectionError}>
                    <CustomSelect
                      label="Division *"
                      multiple
                      disabled={!!editData?.id}
                      options={allDivision}
                      value={formik.values.divisions.map((d: { divisionId: any }) => d.divisionId)}
                      onChange={(val) => {
                        const selectedDivs = val as string[];
                        const existingDivs = formik.values.divisions || [];
                        const selectedType = activeAssignmentTypes.find(
                          (assignmentType) => assignmentType.id === formik.values.assignmentTypeId
                        );
                        const defaultDueDays = selectedType?.defaultDueDays;

                        const newDivisions = selectedDivs.map((divId) => {
                          const selectedDivData = allDivision.find((d) => d.id === divId);
                          const existing = existingDivs.find(
                            (d: { divisionId: string }) => d.divisionId === divId
                          );
                          const publishDate = dayjs();
                          return (
                            existing || {
                              divisionId: divId,
                              divisionName: selectedDivData?.name || '',
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
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={!!divisionSelectionError}
                      helperText={divisionSelectionError}
                    />
                  </ShakingTextField>
                </Grid>

                {/* Subject */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.subjectId && formik.errors.subjectId)}>
                    <CustomSelect
                      label="Subject *"
                      disabled={!!editData?.id || !formik.values.divisions.length}
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
                      }}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.subjectId && formik.errors.subjectId)}
                      helperText={
                        formik.touched.subjectId && typeof formik.errors.subjectId === 'string'
                          ? formik.errors.subjectId
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* Chapters (optional, links assignment to syllabus assessment status) */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={
                      Array.isArray(chapterResponse)
                        ? chapterResponse
                        : chapterResponse?.data?.items || []
                    }
                    disabled={!formik.values.subjectId}
                    loading={isChapterLoading || isChapterFetching}
                    value={(Array.isArray(chapterResponse)
                      ? chapterResponse
                      : chapterResponse?.data?.items || []
                    ).filter((c: any) => ((formik.values as any).chapterIds || []).includes(c.id))}
                    onChange={(_event, newValue: any[]) => {
                      formik.setFieldValue(
                        'chapterIds',
                        newValue.map((c: any) => c.id)
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
                        label="Link to Chapter(s)"
                        size="small"
                        fullWidth
                        helperText="Links this assignment to the syllabus assessment status"
                      />
                    )}
                    slotProps={{ chip: { size: 'small', variant: 'soft' as any } }}
                  />
                </Grid>

                {/* Assignment Title */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                    <LanguageInputField
                      fullWidth
                      label="Assignment Title *"
                      name="title"
                      size="small"
                      value={formik.values.title}
                      onChange={(e) => {
                        const onlyLetters = e.target.value.replace(/[^A-Za-z0-9&()_\-\s]/g, '');
                        const capitalized = onlyLetters.replace(/\b\w/g, (c) => c.toUpperCase());
                        formik.setFieldValue('title', capitalized);
                      }}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={
                        formik.touched.title && typeof formik.errors.title === 'string'
                          ? formik.errors.title
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                {/* Assignment Type */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.assignmentTypeId && formik.errors.assignmentTypeId)}
                  >
                    <CustomSelect
                      label="Assignment Type *"
                      options={activeAssignmentTypes}
                      labelKey="assignmentTypeName"
                      valueKey="id"
                      isLoading={isAssignmentTypeLoading || isAssignmentTypeFetching}
                      value={formik.values.assignmentTypeId || ''}
                      onChange={(value) => {
                        const assignmentTypeId = String(value);
                        const selectedType = activeAssignmentTypes.find(
                          (assignmentType) => assignmentType.id === assignmentTypeId
                        );
                        formik.setFieldValue('assignmentTypeId', assignmentTypeId);
                        if (!selectedType) return;

                        setPendingAssignmentTypeId(assignmentTypeId);
                        typeDefaultsDialog.onTrue();
                      }}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.assignmentTypeId && formik.errors.assignmentTypeId)}
                      helperText={
                        formik.touched.assignmentTypeId &&
                          typeof formik.errors.assignmentTypeId === 'string'
                          ? formik.errors.assignmentTypeId
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    label="Evaluation Method *"
                    options={ASSIGNMENT_EVALUATION_METHOD_OPTIONS}
                    labelKey="label"
                    valueKey="value"
                    value={formik.values.evaluationMethod}
                    onChange={(value) => {
                      const evaluationMethod = Number(value) as AssignmentEvaluationMethod;
                      const evaluationRequired =
                        evaluationMethod !== AssignmentEvaluationMethod.NoEvaluation;
                      formik.setFieldValue('evaluationMethod', evaluationMethod);
                      formik.setFieldValue('evaluationRequired', evaluationRequired);
                      if (!evaluationUsesMarks(evaluationRequired, evaluationMethod)) {
                        formik.setFieldValue('totalMarks', '');
                      }
                      if (evaluationMethod !== AssignmentEvaluationMethod.Rubric) {
                        formik.setFieldValue('rubricTemplateId', '');
                      }
                    }}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  />
                </Grid>

                {usesMarks && (
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
                        helperText={
                          formik.touched.totalMarks && typeof formik.errors.totalMarks === 'string'
                            ? formik.errors.totalMarks
                            : undefined
                        }
                        size="small"
                        onKeyDown={(event) => {
                          if (['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault();
                        }}
                        inputProps={{ min: 1, max: 999, maxLength: 3 }}
                      />
                    </ShakingTextField>
                  </Grid>
                )}

                {usesRubric && !editData?.id && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CustomSelect
                      label="Rubric Template *"
                      options={rubricTemplates}
                      labelKey="title"
                      valueKey="id"
                      value={formik.values.rubricTemplateId}
                      isLoading={isRubricTemplateFetching}
                      onChange={(value) => formik.setFieldValue('rubricTemplateId', String(value))}
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={Boolean(
                        formik.touched.rubricTemplateId && formik.errors.rubricTemplateId
                      )}
                      helperText={
                        formik.touched.rubricTemplateId &&
                          typeof formik.errors.rubricTemplateId === 'string'
                          ? formik.errors.rubricTemplateId
                          : undefined
                      }
                    />
                  </Grid>
                )}
              </SectionCard>
            </Grid>

            {/* Description Section */}
            <Grid size={{ xs: 12 }}>
              <SectionCard
                title="Description & Attachments"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Box sx={{ flex: 1, ml: 0.5 }}>
                    <CustomTooltip
                      title="Provide instructions and upload necessary files"
                      placement="right"
                      arrow
                    >
                      <IconButton
                        size="small"
                        aria-label="About description and attachments"
                        sx={{ p: 0.25 }}
                      >
                        <Iconify icon="lucide:info" width={18} color="info.main" />
                      </IconButton>
                    </CustomTooltip>
                  </Box>
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
                      helperText={
                        formik.touched.description && typeof formik.errors.description === 'string'
                          ? formik.errors.description
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ReferenceFileUpload
                    value={
                      typeof formik.values.attachment === 'string'
                        ? {
                          name: getFileNameFromUrl(formik.values.attachment),
                          filePath: formik.values.attachment,
                          url: formik.values.attachment,
                        }
                        : (formik.values.attachment ?? undefined)
                    }
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

            {/* Schedule Section */}
            {formik.values.divisions.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <SectionCard
                  title="Schedule & Deadlines"
                  paperProps={{ sx: cardStyle }}
                  headerContent={
                    <Box sx={{ flex: 1, ml: 0.5 }}>
                      <CustomTooltip
                        title="Set publish and due dates for each division"
                        placement="right"
                        arrow
                      >
                        <IconButton
                          size="small"
                          aria-label="About schedule and deadlines"
                          sx={{ p: 0.25 }}
                        >
                          <Iconify icon="lucide:info" width={18} color="info.main" />
                        </IconButton>
                      </CustomTooltip>
                    </Box>
                  }
                >
                  <Grid container spacing={1} sx={{ width: '100%' }}>
                    {formik.values.divisions.map((div: any, idx: number) => {
                      const divError = (formik.errors.divisions as any[])?.[idx] as
                        Record<string, string> | undefined;
                      const divTouched = (formik.touched.divisions as any[])?.[idx] as
                        Record<string, boolean> | undefined;
                      return (
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
                                  label={`Div ${div.divisionName || allDivision.find((d) => d.id === div.divisionId)?.name || ''}`}
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
                                      typeof divError === 'object' &&
                                      !!divError?.publishDate &&
                                      (!!divTouched?.publishDate || formik.submitCount > 0)
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
                                        const selectedType = activeAssignmentTypes.find(
                                          (assignmentType) =>
                                            assignmentType.id === formik.values.assignmentTypeId
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
                                        typeof divError === 'object' &&
                                          divError?.publishDate &&
                                          (!!divTouched?.publishDate || formik.submitCount > 0)
                                          ? divError.publishDate
                                          : 'When to show this assignment to students'
                                      }
                                      slotProps={{
                                        popper: { placement: 'top-start', sx: { zIndex: 1300 } },
                                        textField: {
                                          fullWidth: true,
                                          size: 'small',
                                          error:
                                            typeof divError === 'object' &&
                                            !!divError?.publishDate &&
                                            (!!divTouched?.publishDate || formik.submitCount > 0),
                                        },
                                      }}
                                    />
                                  </ShakingTextField>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                  <ShakingTextField
                                    error={
                                      typeof divError === 'object' &&
                                      !!divError?.dueDate &&
                                      (!!divTouched?.dueDate || formik.submitCount > 0)
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
                                      helperText={
                                        typeof divError === 'object' &&
                                          divError?.dueDate &&
                                          (!!divTouched?.dueDate || formik.submitCount > 0)
                                          ? divError.dueDate
                                          : 'Must be after the publish date'
                                      }
                                      slotProps={{
                                        popper: { placement: 'top-start', sx: { zIndex: 1300 } },
                                        textField: {
                                          fullWidth: true,
                                          size: 'small',
                                          error:
                                            typeof divError === 'object' &&
                                            !!divError?.dueDate &&
                                            (!!divTouched?.dueDate || formik.submitCount > 0),
                                        },
                                      }}
                                    />
                                  </ShakingTextField>
                                </Grid>
                              </Grid>
                            </Stack>
                          </Box>
                        </Grid>
                      );
                    })}
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
                  <Box sx={{ flex: 1, ml: 0.5 }}>
                    <CustomTooltip
                      title="How should students submit this assignment?"
                      placement="right"
                      arrow
                    >
                      <IconButton
                        size="small"
                        aria-label="About submission settings"
                        sx={{ p: 0.25 }}
                      >
                        <Iconify icon="lucide:info" width={18} color="info.main" />
                      </IconButton>
                    </CustomTooltip>
                  </Box>
                }
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
                          description: 'No physical or digital submission needed.',
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
            justifyContent: 'flex-end',
            gap: 1,
            borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
            bgcolor: 'background.paper',
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
            size="small"
            variant="contained"
            loading={activeSubmitMode === 'draft'}
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={editData ? 16 : 20}
                height={editData ? 16 : 20}
              />
            }
            type="button"
            onClick={() => submitAssignment('draft')}
          >
            {editData ? 'Update Draft' : 'Save Draft'}
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
                <Iconify icon={shouldSchedule ? 'solar:calendar-mark-bold' : GlobalIcons.publish} />
              }
              onClick={() => submitAssignment(shouldSchedule ? 'schedule' : 'publish')}
            >
              {shouldSchedule ? 'Schedule Publish' : 'Publish Now'}
            </LoadingButton>
          )}
        </Box>
        <DocumentPreviewDialog
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          url={previewDoc || ''}
          documentName={previewFileState ? previewFileState.name : 'Document Preview'}
        />
        <ConfirmDialog
          open={typeDefaultsDialog.value}
          disableBackdropClick
          onClose={() => {
            typeDefaultsDialog.onFalse();
            setPendingAssignmentTypeId(null);
          }}
          icon="info"
          title="Apply Assignment Type Defaults?"
          content={
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                The selected assignment type has pre-configured defaults for:
              </Typography>
              <Box
                component="ul"
                sx={{
                  pl: 2.5,
                  m: 0,
                  '& li': { mb: 0.5 },
                }}
              >
                {['Submission type', 'Evaluation method & marks', 'Due date offset'].map((item) => (
                  <Typography key={item} component="li" variant="body2" color="text.secondary">
                    {item}
                  </Typography>
                ))}
              </Box>
              <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 500 }}>
                Apply defaults or keep your current values?
              </Typography>
            </Box>
          }
          action={
            <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
              <Button
                type="button"
                size="small"
                variant="outlined"
                startIcon={<Iconify icon="solar:shield-check-bold" />}
                onClick={() => {
                  typeDefaultsDialog.onFalse();
                  setPendingAssignmentTypeId(null);
                }}
              >
                Keep Current
              </Button>
              <Button
                type="button"
                size="small"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
                onClick={() => {
                  const assignmentType = activeAssignmentTypes.find(
                    (item) => item.id === pendingAssignmentTypeId
                  );
                  if (assignmentType) {
                    formik.setValues(applyAssignmentTypeDefaults(formik.values, assignmentType));
                  }
                  typeDefaultsDialog.onFalse();
                  setPendingAssignmentTypeId(null);
                }}
              >
                Apply Defaults
              </Button>
            </Stack>
          }
        />
        <ConfirmDialog
          open={overrideDialog.value}
          disableBackdropClick
          onClose={() => {
            overrideDialog.onFalse();
            setPendingSubmitValues(null);
            pendingOverrideRef.current = false;
            finishSubmission();
          }}
          icon="warning"
          title={
            submitModeRef.current === 'publish'
              ? 'Publish assignment with your settings?'
              : submitModeRef.current === 'schedule'
                ? 'Schedule assignment with your settings?'
                : 'Save assignment with your settings?'
          }
          content={
            <Typography variant="body2" color="text.secondary">
              The marks, submission method, evaluation, or due date differ from the assignment type
              defaults. Your selected values will be used for this assignment.
            </Typography>
          }
          action={
            <Button
              disabled={referenceUpload.isUploading || Boolean(referenceUpload.error)}
              type="button"
              size="small"
              variant="contained"
              color="warning"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={async () => {
                if (!pendingSubmitValues) return;
                const values = pendingSubmitValues;
                overrideDialog.onFalse();
                setPendingSubmitValues(null);
                try {
                  await saveAssignment(values);
                } finally {
                  pendingOverrideRef.current = false;
                  finishSubmission();
                }
              }}
            >
              {submitModeRef.current === 'publish'
                ? 'Publish assignment'
                : submitModeRef.current === 'schedule'
                  ? 'Schedule assignment'
                  : 'Save assignment'}
            </Button>
          }
        />
      </Box>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
