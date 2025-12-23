'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useState, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

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
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik<ISubjectFormValues>({
    initialValues: getNoOfLectureInitialValues(editData, selectedClass),
    enableReinitialize: true, // important when using useMemo
    validationSchema: noOfLectureValidationSchema,
    onSubmit: (values) => {
      // Calculate total lectures
      const totalLectures = values.subjects.reduce((sum, subject) => sum + subject.noOfLecture, 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const submitData = {
        ...values,
        totalLectures,
      };
      if (editData) {
        shikshaMitraToast.success({
          message: `Weekly No. of lectures updated for class ${values.className}`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Weekly No. of lectures added for class ${values.className}`,
        });
      }
      onClose?.(null, true);
    },
  });

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
  }, [medium]);

  const { values, setFieldValue } = formik;

  useEffect(() => {
    if (editData?.className && allClass.length > 0) {
      const matchingClass = allClass.find((cls) => cls.name === editData.className);

      if (matchingClass) {
        setFieldValue('className', matchingClass.id);
      }
    }
  }, [editData, allClass, setFieldValue]);

  useEffect(() => {
    if (!editData && selectedClass) {
      const dummySubjects = generateDummySubjects().map((subj, index) => ({
        id: `subject-${index}`,
        ...subj,
        noOfLecture: '',
      }));

      // formik.setFieldValue('className', selectedClass);
      formik.setFieldValue('subjects', dummySubjects);
      formik.setFieldValue('totalLectures', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, editData, classes]); // only run when selectedClass or editData changes

  useEffect(() => {
    if (!editData && (!values.subjects || values.subjects.length === 0)) {
      const dummySubjects = generateDummySubjects().map((subj, index) => ({
        id: `subject-${index}`,
        ...subj,
        noOfLecture: null,
      }));

      setFieldValue('subjects', dummySubjects);
      setFieldValue('totalLectures', 0);
    }
  }, [editData, values.subjects, setFieldValue]);

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
                value={formik.values.className}
                onChange={(val) => {
                  formik.setFieldValue('className', val as string);

                  const dummySubjects = generateDummySubjects().map((subj, index) => ({
                    id: `subject-${index}`,
                    ...subj,
                    noOfLecture: null,
                  }));
                  formik.setFieldValue('subjects', dummySubjects);
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
          <Button
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={editData ? 16 : 20}
                height={editData ? 16 : 20}
              />
            }
            form="dialog-form"
            onClick={() => formik.handleSubmit()}
            size="small"
            variant="contained"
          >
            {editData ? 'Update' : 'Submit'}
            {/* {isEdit ? 'Update' : 'Submit'} */}
          </Button>
          {/* <SubmitButton size="small" disabled={disabled} /> */}
        </DialogActions>
      )}
      {/* </form> */}
    </BackPopUpChecked>
  );
};

export default CreateNoOfLecture;

export const generateDummySubjects = () => [
  { name: 'Mathematics', subjectCode: 'MTH101', subjectColor: '#42a5f5' },
  { name: 'Science', subjectCode: 'SCI101', subjectColor: '#66bb6a' },
  { name: 'English', subjectCode: 'ENG101', subjectColor: '#ef5350' },
  { name: 'Social Studies', subjectCode: 'SST101', subjectColor: '#ab47bc' },
  { name: 'Gujarati', subjectCode: 'GUJ101', subjectColor: '#ffa726' },
  { name: 'Computer', subjectCode: 'COMP101', subjectColor: '#26c6da' },
  { name: 'Art', subjectCode: 'ART101', subjectColor: '#8d6e63' },
  { name: 'General Knowledge', subjectCode: 'GK101', subjectColor: '#78909c' },
  { name: 'Physics', subjectCode: 'PHY101', subjectColor: '#5c6bc0' },
];
