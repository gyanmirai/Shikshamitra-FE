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
import { AcademicDateTimePicker as DateTimePicker } from 'src/components/academic-date-picker';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetAssignmentTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';
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
} from '@mui/material';
import {
  useGetSubjectAssignmentsQuery,
  useUploadCurriculumFileMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useAddAssignmentMutation,
  useGetAssignmentByIdQuery,
  useUpdateAssignmentMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';

import { getAssignmentInitialValues } from './assignmentInitialValues';
import { assignmentValidationSchema } from './assignmentValidationSchema';

import type { IAssignmentFormProps } from '../type';

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
      gap: 1,
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
  const [subjectSelectValue, setSubjectSelectValue] = useState('');

  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [localFileNames, setLocalFileNames] = useState<Record<string, string>>({});

  const getFileNameFromUrl = (file: string | File): string => {
    if (!file) return '';
    if (typeof file !== 'string') return file.name;
    if (localFileNames && localFileNames[file]) return localFileNames[file];

    const normalized = file.split('?')[0];
    const segments = normalized.split('/').filter(Boolean);
    let rawName = decodeURIComponent(segments[segments.length - 1] || '');

    if (rawName.length > 37 && rawName[36] === '_') {
      const maybeUuid = rawName.substring(0, 36);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(maybeUuid)) {
        rawName = rawName.substring(37);
      }
    }

    return rawName;
  };

  const handleDropzoneChange = async (value: any[]) => {
    const droppedFiles = Array.isArray(value) ? value : [value];
    const newFiles = droppedFiles.filter((f): f is File => f instanceof File);
    const existingFiles = droppedFiles.filter((f) => !(f instanceof File));

    if (newFiles.length === 0) {
      formik.setFieldValue('attachments', existingFiles);
      return;
    }

    try {
      const uploadPromises = newFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('File', file);
        const response = await uploadCurriculumFile(formData).unwrap();
        if (response.data) {
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            url: response.data,
            filePath: response.data,
          };
        }
        return file;
      });

      const results = await Promise.all(uploadPromises);

      const nameUpdates: Record<string, string> = {};
      results.forEach((res) => {
        if ('url' in res && res.url) {
          nameUpdates[res.url as string] = res.name;
        }
      });
      setLocalFileNames((prev) => ({ ...prev, ...nameUpdates }));

      const newDocs = [...existingFiles, ...results];
      formik.setFieldValue('attachments', newDocs);
      shikshaMitraToast.success({ message: 'Document(s) uploaded successfully' });
    } catch (error) {
      console.error('Upload failed:', error);
      shikshaMitraToast.error({ message: 'Upload failed' });
    }
  };

  const [addAssignment, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAssignmentMutation,
  });

  const [updateAssignment, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentMutation,
  });

  const {
    data: assignmentByIdData,
    isLoading: isAssignmentByIdLoading,
    isFetching: isAssignmentByIdFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentByIdQuery,
    params: { assignmentId: editData?.id, academicMediumId: medium?.id },
    options: { skip: !editData?.id },
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
    params: { academicMediumId: (medium as Medium)?.id },
    options: { skip: !(medium as Medium)?.id },
  });

  const activeAssignmentTypes = useMemo(() => {
    const list = (assignmentTypeData?.data || []).filter((t: any) => t.status === 0);
    if (editData?.assignmentTypeId) {
      const editType = (assignmentTypeData?.data || []).find((t: any) => t.id === editData.assignmentTypeId);
      if (editType && editType.status === 1) {
        list.push(editType);
      }
    }
    return list;
  }, [assignmentTypeData?.data, editData?.assignmentTypeId]);

  const assignmentInitialValues = useMemo(
    () => getAssignmentInitialValues(assignmentByIdData?.data || editData, classes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignmentByIdData?.data, editData?.id, classes]
  );

  const formik = useFormik({
    initialValues: assignmentInitialValues,
    enableReinitialize: true,
    validationSchema: assignmentValidationSchema(currentYear),
    onSubmit: async (values) => {
      try {
        // Check if user is overriding selected template defaults
        const selectedType = activeAssignmentTypes.find((t: any) => t.id === values.assignmentTypeId);
        if (selectedType) {
          let hasOverride = false;
          if (selectedType.defaultSubmissionType !== undefined && selectedType.defaultSubmissionType !== null && selectedType.defaultSubmissionType !== values.submissionType) {
            hasOverride = true;
          }

          if (selectedType.defaultMarks !== undefined && selectedType.defaultMarks !== null && Number(selectedType.defaultMarks) !== Number(values.totalMarks)) {
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
              'Warning: You have modified marks, submission settings, or due days from the default assignment type template. Are you sure you want to override these settings?'
            );
            if (!confirmOverride) return;
          }
        }

        const formData = new FormData();
        formData.append('StandardId', values.classId);
        formData.append('SubjectId', values.subjectId);
        formData.append('Title', values.title);
        formData.append('AssignmentTypeId', values.assignmentTypeId);
        formData.append('TotalMarks', String(values.totalMarks));
        if (values.description) formData.append('Description', values.description);
        formData.append('SubmissionType', String(values.submissionType));

        if (values.attachments && values.attachments.length > 0) {
          values.attachments.forEach((file: any) => {
            const fileValue = file instanceof File ? null : file.url || file.filePath || file;
            if (fileValue) formData.append('attachment', fileValue);
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

        if (editData) {
          await updateAssignment({ assignmentId: editData.id, body: formData }).unwrap();
          shikshaMitraToast.success({
            message: `Assignment "${values.title}" has been updated successfully.`,
          });
        } else {
          await addAssignment({ academicMediumId: medium?.id, body: formData }).unwrap();
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
    params: { standardId: formik.values.classId },
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

  const isLoadingData = isAssignmentByIdLoading || isAssignmentByIdFetching;

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
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
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
                          (t: any) => t.id === formik.values.assignmentTypeId
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
                              dueDate: defaultDueDays !== undefined && defaultDueDays !== null ? publishDate.add(defaultDueDays, 'day') : null,
                            }
                          );
                        });
                        formik.setFieldValue('divisions', newDivisions);
                      }}
                      labelKey="name"
                      valueKey="id"
                      formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                      error={!!(formik.touched.divisions && formik.errors.divisions)}
                      helperText={
                        formik.touched.divisions
                          ? typeof formik.errors.divisions === 'string'
                            ? formik.errors.divisions
                            : (formik.errors.divisions as any[])?.some(
                                  (divErr: any) =>
                                    typeof divErr === 'object' &&
                                    (divErr?.publishDate || divErr?.dueDate)
                                )
                              ? 'Select schedule dates also'
                              : undefined
                          : undefined
                      }
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

                {/* Assignment Title */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                    <TextField
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
                      onChange={(val) => {
                        formik.setFieldValue('assignmentTypeId', val);
                        const selectedType = activeAssignmentTypes.find((t: any) => t.id === val);
                        if (selectedType) {
                          if (selectedType.defaultSubmissionType !== undefined && selectedType.defaultSubmissionType !== null) {
                            formik.setFieldValue('submissionType', selectedType.defaultSubmissionType);
                          }
                          if (selectedType.defaultMarks !== undefined && selectedType.defaultMarks !== null) {
                            formik.setFieldValue('totalMarks', selectedType.defaultMarks);
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

                {/* Total Marks */}
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
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                      }}
                      inputProps={{ min: 1, max: 999, maxLength: 3 }}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.value.length > 3) {
                          target.value = target.value.slice(0, 3);
                        }
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
                      helperText={
                        formik.touched.description && typeof formik.errors.description === 'string'
                          ? formik.errors.description
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FileUploader
                    value={formik.values.attachments}
                    multiple
                    showVisibleDocumentCount={1}
                    onChange={handleDropzoneChange}
                    onPreview={(file: any) => {
                      const url =
                        file instanceof File
                          ? URL.createObjectURL(file)
                          : file?.url || file?.filePath || (typeof file === 'string' ? file : '');
                      setPreviewDoc(url);
                    }}
                    primaryText="Upload Reference File"
                    secondaryText="Supports PDF, DOCX, IMG (Max 5MB)"
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
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Set publish and due dates for each division
                    </Typography>
                  }
                >
                  <Grid container spacing={1} sx={{ width: '100%' }}>
                    {formik.values.divisions.map((div: any, idx: number) => {
                      const divError = (formik.errors.divisions as any[])?.[idx] as
                        | Record<string, string>
                        | undefined;
                      const divTouched = (formik.touched.divisions as any[])?.[idx] as
                        | Record<string, boolean>
                        | undefined;
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
                                      !!divTouched?.publishDate
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
                                          (t: any) => t.id === formik.values.assignmentTypeId
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
                                            typeof divError === 'object' &&
                                            !!divError?.publishDate &&
                                            !!divTouched?.publishDate,
                                          helperText:
                                            divTouched?.publishDate &&
                                            typeof divError === 'object' &&
                                            typeof divError?.publishDate === 'string'
                                              ? divError.publishDate
                                              : undefined,
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
                                      !!divTouched?.dueDate
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
                                            typeof divError === 'object' &&
                                            !!divError?.dueDate &&
                                            !!divTouched?.dueDate,
                                          helperText:
                                            divTouched?.dueDate &&
                                            typeof divError === 'object' &&
                                            typeof divError?.dueDate === 'string'
                                              ? divError.dueDate
                                              : undefined,
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
                title="Submission Type"
                paperProps={{ sx: cardStyle }}
                headerContent={
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    How should students submit this assignment?
                  </Typography>
                }
              >
                <Grid size={{ xs: 12 }}>
                  <FormControl
                    component="fieldset"
                    error={!!(formik.touched.submissionType && formik.errors.submissionType)}
                    fullWidth
                  >
                    <Grid container spacing={1}>
                      {[
                        { value: 0, label: 'Online Text' },
                        { value: 1, label: 'File Upload' },
                        { value: 2, label: 'In-Person' },
                        { value: 3, label: 'No Submission Required' },
                      ].map((item) => (
                        <Grid size={{ xs: 12, md: 3 }} key={item.value}>
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
            gap: 1,
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
            loading={isAddLoading || isUpdateLoading}
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
        <DocumentPreviewDialog
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          url={previewDoc || ''}
          documentName={previewDoc ? getFileNameFromUrl(previewDoc) : ''}
        />
      </Box>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
