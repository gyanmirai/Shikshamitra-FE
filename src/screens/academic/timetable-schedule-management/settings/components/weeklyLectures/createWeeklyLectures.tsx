'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { SubjectType } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import {
  Box,
  Grid,
  Button,
  Skeleton,
  TextField,
  Typography,
  ListItemText,
  DialogActions,
} from '@mui/material';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useGetWeeklyLectureSlotsQuery,
  useGetWeeklyLectureSlotByIdQuery,
  useCreateWeeklyLectureSlotMutation,
  useUpdateWeeklyLectureSlotMutation,
} from 'src/redux/academicAPI/timetableApi/weeklyLecturesApi';

import { getNoOfLectureInitialValues } from './initialValues';
import { noOfLectureValidationSchema } from './validationSchema';

import type { ISubjectFormValues, ICreateNoOfLectureProps } from './type';

const CreateNoOfLecture: React.FC<ICreateNoOfLectureProps> = ({
  open,
  onClose,
  isEdit,
  disabled,
  editData,
  selectedClass,
}) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [addWeeklyLectureSlot, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateWeeklyLectureSlotMutation,
  });
  const [updateWeeklyLectureSlot, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateWeeklyLectureSlotMutation,
  });
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: {
      skip: !medium?.id,
    },
  });
  const { data: weeklyLectureSlotById } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotByIdQuery,
    params: editData?.id || '',
    options: {
      skip: !editData?.id,
    },
  });

  const formik = useFormik<ISubjectFormValues>({
    initialValues: getNoOfLectureInitialValues(weeklyLectureSlotById?.data, selectedClass),
    enableReinitialize: true, // important when using useMemo
    validationSchema: noOfLectureValidationSchema,
    onSubmit: async (values) => {
      const subjectsPayload = values.subjects.map((subject) => ({
        subjectId: subject.subjectId || subject.id,
        weeklyLectures: Number(subject.noOfLecture) || 0,
        electiveGroupId: subject.electiveGroupId || null,
      }));

      if (editData && values.id) {
        const res = await updateWeeklyLectureSlot({
          lectureSlotId: values.id,
          body: {
            subjects: subjectsPayload,
          },
        });
        if (res.data) {
          shikshaMitraToast.success({
            message: `Weekly No. of lectures updated for class ${values.className}`,
          });
          onClose?.(null, true);
        }
      } else {
        const res = await addWeeklyLectureSlot({
          academicMediumId: (medium as any)?.id,
          standardId: values.classId,
          subjects: subjectsPayload,
        });

        if (res.data) {
          shikshaMitraToast.success({
            message: `Weekly No. of lectures added for class ${values.className}`,
          });
          onClose?.(null, true);
        }
      }
    },
  });

  const { data: subjectTableData, isLoading: isSubjectsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      academicMediumId: medium?.id,
      standardId: formik.values.classId,
    },
    options: {
      skip: !medium?.id || !formik.values.classId || !!editData,
    },
  });

  const allClass = useMemo(
    () =>
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [],
    [medium]
  );

  useEffect(() => {
    formik.setFieldValue('classId', editData?.standardId || allClass[0]?.id || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass]);

  // Update classes when organization changes
  // useEffect(() => {
  //   // Flatten the list of standards from all stages
  //   const allClasses =
  //     medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

  //   setAllClass(allClasses);
  //   setClasses(allClasses[0]?.name || '');
  //   setClassId(allClasses[0]?.id || '');
  //   if (!editData && !selectedClass) {
  //     formik.setFieldValue('className', allClasses[0]?.name || '');
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [medium]);

  useEffect(() => {
    if (!editData && selectedClass) {
      const matched = allClass.find((c: any) => c.name === selectedClass || c.id === selectedClass);
      if (matched) {
        formik.setFieldValue('classId', matched.id);
        formik.setFieldValue('className', matched.name);
      }
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('totalLectures', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, editData, allClass]);

  useEffect(() => {
    if (!editData && subjectTableData?.data?.items) {
      const tableData = subjectTableData.data.items
        .filter((item: any) => item.status === 1)
        .map((item: any) => {
          if (item.subjectType === SubjectType.Elective) {
            return {
              id: item.id,
              name: `${item?.electiveGroupName}`,
              subjectCode: '',
              subjectColor: item.color,
              noOfLecture: '',
              subjectId: item.electiveGroupId,
              electiveGroupId: item.electiveGroupId,
              subjectType: item.subjectType,
              subjects: item.subjects,
              subjectCount: item.subjects.length,
            };
          }
          return {
            name: item.subjects[0]?.subjectName,
            subjectCode: item.subjects[0]?.subjectCode,
            subjectColor: item.color,
            noOfLecture: '',
            subjectId: item.subjects[0]?.subjectId,
            electiveGroupId: null,
            subjectType: item.subjectType,
          };
        });
      formik.setFieldValue('subjects', tableData);
      formik.setFieldValue('totalLectures', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectTableData, editData]);

  // const initialValues = useMemo(() => {
  //   const base = getNoOfLectureInitialValues(editData, selectedClass);
  //   if (!editData && selectedClass) {
  //     return {
  //       ...base,
  //       subjects: generateDummySubjects(),
  //       totalLectures: 40,
  //     };
  //   }
  //   return base;
  // }, [editData, selectedClass]);

  // // Update total lectures whenever subject lectures change
  // useEffect(() => {
  //   const total = formik.values.subjects.reduce((sum, subject) => sum + subject.noOfLecture, 0);
  //   if (total !== formik.values.totalLectures) {
  //     formik.setFieldValue('totalLectures', total);
  //   }
  // }, [formik, formik.values.subjects]);

  const subjectColumnRender = useCallback(
    (value: any, row: any) => {
      const index = formik.values.subjects.findIndex((item) => item.id === row.id);
      return (
        <ShakingTextField
          error={
            !!formik.touched.subjects?.[index]?.noOfLecture &&
            !!(formik.errors.subjects?.[index] as any)?.noOfLecture
          }
        >
          <TextField
            type="number"
            size="small"
            label="Weekly Lectures *"
            name={`subjects[${index}].noOfLecture`}
            value={formik.values.subjects[index]?.noOfLecture ?? ''}
            onChange={(e) => {
              formik.setFieldValue(`subjects[${index}].noOfLecture`, e.target.value);
              // formik.setFieldTouched(`subjects[${index}].noOfLecture`, true);
            }}
            onBlur={formik.handleBlur}
            inputProps={{ min: 0 }}
            disabled={disabled && !isEdit}
            error={
              !!formik.touched.subjects?.[index]?.noOfLecture &&
              !!(formik.errors.subjects?.[index] as any)?.noOfLecture
            }
            helperText={
              formik.touched.subjects?.[index]?.noOfLecture &&
              (formik.errors.subjects?.[index] as any)?.noOfLecture
                ? String((formik.errors.subjects?.[index] as any).noOfLecture)
                : ''
            }
            onKeyDown={(e) => {
              if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                e.preventDefault();
              }
            }}
            sx={{ minWidth: '100px', width: '100%', mb: 1.5 }}
          />
        </ShakingTextField>
      );
    },
    [formik, disabled, isEdit]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit}> */}
      <DialogScrollContent>
        {/* <Scrollbar sx={{ p: 2, height: '450px' }}> */}
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.classId && formik.errors.classId)}>
              <CustomSelect
                options={allClass}
                value={formik.values.classId}
                onChange={(val) => {
                  formik.setFieldValue('classId', val);
                  const found = allClass.find((c) => c.id === val);
                  formik.setFieldValue('className', found?.name || val);
                  formik.setFieldValue('subjects', []);
                  formik.setFieldValue('totalLectures', 0);
                }}
                label="Class *"
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                error={formik.touched.classId && Boolean(formik.errors.classId)}
                helperText={
                  formik.touched.classId && typeof formik.errors.classId === 'string'
                    ? formik.errors.classId
                    : undefined
                }
                disabled={disabled || (isEdit && !!editData)}
              />
            </ShakingTextField>
          </Grid>

          {isSubjectsLoading
            ? formik.values.classId && (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Box key={i} display="flex" alignItems="center" gap={2} px={1}>
                        <Skeleton variant="rounded" width={24} height={24} />
                        <Skeleton variant="text" sx={{ flex: 1 }} height={40} />
                        <Skeleton variant="rounded" width={120} height={40} />
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )
            : formik.values.classId && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap={2}
                    maxHeight="500px"
                    height="100%"
                  >
                    <CustomizableTable
                      tableId="table-subject-list"
                      isSearch={false}
                      isShowedDense={false}
                      noDataText={<>No Subject&apos;s weekly lectures Found </>}
                      isFilter={false}
                      columns={[
                        {
                          id: 'name',
                          label: 'Subject',
                          isFilter: false,
                          render: (value, row) => (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <SubjectColorIndicator color={row.subjectColor} />
                                    <Typography variant="caption" fontSize="13px">
                                      {value}
                                    </Typography>
                                    {row?.subjects?.length > 0 && (
                                      <CustomTooltip
                                        title={
                                          <Box display="flex" flexDirection="column" gap={0.5}>
                                            {row.subjects.map((sub: any) => (
                                              <Typography key={sub.subjectId} variant="caption">
                                                {sub.subjectName} ({sub.subjectCode})
                                              </Typography>
                                            ))}
                                          </Box>
                                        }
                                      >
                                        <Typography
                                          variant="caption"
                                          fontSize="13px"
                                          sx={{ cursor: 'pointer' }}
                                          color="primary"
                                        >
                                          ({row.subjectCount})
                                        </Typography>
                                      </CustomTooltip>
                                    )}
                                  </Box>
                                }
                                secondary={`(${SubjectType[row.subjectType]})`}
                              />
                            </Box>
                          ),
                        },
                        {
                          id: 'noOfLecture',
                          label: 'Weekly Lectures',
                          isSort: false,
                          isFilter: false,
                          render: subjectColumnRender,
                        },
                      ]}
                      data={formik.values.subjects}
                    />
                  </Box>
                </Grid>
              )}
        </Grid>

        {/* </Scrollbar> */}
      </DialogScrollContent>
      {!disabled && (
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            onClick={() => {
              onClose?.(null, false);
            }}
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={editData ? 16 : 20}
                height={editData ? 16 : 20}
              />
            }
            loading={isAddLoading || isUpdateLoading}
            form="dialog-form"
            onClick={(e: any) => formik.handleSubmit(e)}
            size="small"
            variant="contained"
          >
            {editData ? 'Update' : 'Submit'}
            {/* {isEdit ? 'Update' : 'Submit'} */}
          </LoadingButton>
          {/* <SubmitButton size="small" disabled={disabled} /> */}
        </DialogActions>
      )}
      {/* </form> */}
    </BackPopUpChecked>
  );
};

export default CreateNoOfLecture;
