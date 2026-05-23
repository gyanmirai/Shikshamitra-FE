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
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import FileUploader from 'src/components/custom-upload';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetAssignmentTypesQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
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
  const [subjectSelectValue, setSubjectSelectValue] = useState('');

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
    data: assignmentTypeData,
    isLoading: isAssignmentTypeLoading,
    isFetching: isAssignmentTypeFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentTypesQuery,
    params: { academicMediumId: (medium as Medium)?.id },
    options: { skip: !(medium as Medium)?.id },
  });

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
  }, [editData?.id, subjectOptionsData?.data?.items]);

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

            {/* Schedule & Deadlines Skeleton */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ ...cardStyle, mb: 2 }}>
                <Skeleton variant="text" width={200} height={28} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={280} height={20} sx={{ mb: 2 }} />
                <Grid container spacing={2}>
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
                        const newDivisions = selectedDivs.map((divId) => {
                          const selectedDivData = allDivision.find((d) => d.id === divId);
                          const existing = existingDivs.find(
                            (d: { divisionId: string }) => d.divisionId === divId
                          );
                          return (
                            existing || {
                              divisionId: divId,
                              divisionName: selectedDivData?.name || '',
                              createdAt: dayjs(),
                              publishDate: null,
                              dueDate: null,
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
                      options={assignmentTypeData?.data || []}
                      labelKey="assignmentTypeName"
                      valueKey="id"
                      isLoading={isAssignmentTypeLoading || isAssignmentTypeFetching}
                      value={formik.values.assignmentTypeId || ''}
                      onChange={(val) => formik.setFieldValue('assignmentTypeId', val)}
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
                    onChange={(value) => formik.setFieldValue('attachments', value)}
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
                  <Grid container spacing={2} sx={{ width: '100%' }}>
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
                              spacing={3}
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

                              <Grid container spacing={2} sx={{ flexGrow: 1 }}>
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
                                      minDateTime={dayjs()}
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
      </Box>
    </BackPopUpChecked>
  );
};

export default AssignmentForm;
