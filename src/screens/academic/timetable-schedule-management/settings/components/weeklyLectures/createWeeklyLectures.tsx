'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useState, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
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
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard name
  const [classes, setClasses] = useState<string>('');
  // State to store selected class/standard ID (used for API calls)
  const [classId, setClassId] = useState<string>('');
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [addWeeklyLectureSlot, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateWeeklyLectureSlotMutation,
  });
  const [updateWeeklyLectureSlot, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateWeeklyLectureSlotMutation,
  });
  const { data: weeklyLectureSlots, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: {
      skip: !medium?.id,
    },
  });
  const { data: weeklyLectureSlotById, isLoading: isLoadingGetById } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetWeeklyLectureSlotByIdQuery,
    params: editData?.id ? { lectureSlotId: editData.id } : undefined,
    options: {
      skip: !editData?.id,
    },
  });

  const formik = useFormik<ISubjectFormValues>({
    initialValues: getNoOfLectureInitialValues(
      weeklyLectureSlotById?.data,
      selectedClass || classes
    ),
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
          standardId: classId,
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
      standardId: classId,
    },
    options: {
      skip: !medium?.id || !classId || !!editData,
    },
  });

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
    setClassId(allClasses[0]?.id || '');
    if (!editData && !selectedClass) {
      formik.setFieldValue('className', allClasses[0]?.name || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medium]);

  useEffect(() => {
    if (!editData && selectedClass) {
      const matched = allClass.find((c) => c.name === selectedClass || c.id === selectedClass);
      if (matched) {
        setClassId(matched.id);
        formik.setFieldValue('className', matched.name);
      }
      formik.setFieldValue('subjects', []);
      formik.setFieldValue('totalLectures', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, editData, allClass]); // only run when selectedClass or editData changes

  useEffect(() => {
    if (!editData && subjectTableData?.data?.items) {
      const mappedSubjects = subjectTableData.data.items.flatMap((item: any) => {
        if (item.subjectType === 1) {
          return item.subjects.map((sub: any) => ({
            id: sub.assignedId || sub.subjectId,
            subjectId: sub.subjectId,
            name: sub.subject?.name || sub.subjectName,
            subjectCode: sub.subjectCode,
            subjectColor: sub.subject?.color || sub.color,
            noOfLecture: '',
            electiveGroupId: item.electiveGroupId || sub.electiveGroupId || null,
          }));
        }
        return [
          {
            id: item.subjects[0]?.assignedId || item.subjects[0]?.subjectId,
            subjectId: item.subjects[0]?.subjectId,
            name: item.subjects[0]?.subject?.name || item.subjects[0]?.subjectName,
            subjectCode: item.subjects[0]?.subjectCode,
            subjectColor: item.subjects[0]?.subject?.color || item.subjects[0]?.color,
            noOfLecture: '',
            electiveGroupId: null,
          },
        ];
      });
      formik.setFieldValue('subjects', mappedSubjects);
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
            <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
              <CustomSelect
                options={allClass}
                value={classId}
                onChange={(val) => {
                  setClassId(val as string);
                  const found = allClass.find((c) => c.id === val);
                  formik.setFieldValue('className', found?.name || val);
                  formik.setFieldValue('subjects', []);
                  formik.setFieldValue('totalLectures', 0);
                }}
                label="Class *"
                labelKey="name"
                valueKey="id"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                error={formik.touched.className && Boolean(formik.errors.className)}
                helperText={
                  formik.touched.className && typeof formik.errors.className === 'string'
                    ? formik.errors.className
                    : undefined
                }
                disabled={disabled || (isEdit && !!editData)}
              />
            </ShakingTextField>
          </Grid>

          {formik.values.className && (
            <Grid size={{ xs: 12 }}>
              <Box display="flex" flexDirection="column" gap={2} maxHeight="500px" height="100%">
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
                          <SubjectColorIndicator color={row.subjectColor} />
                          <Typography variant="caption" fontSize="13px">
                            {value} ({row.subjectCode})
                          </Typography>
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
