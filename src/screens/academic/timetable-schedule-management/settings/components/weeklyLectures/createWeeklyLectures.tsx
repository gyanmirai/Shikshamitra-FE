'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback } from 'react';

import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

import { getNoOfLectureInitialValues } from './initialValues';
import { noOfLectureValidationSchema } from './validationSchema';

import type { ISubjectFormValues, ICreateNoOfLectureProps } from './type';

const CreateNoOfLecture: React.FC<ICreateNoOfLectureProps> = ({
  open,
  onClose,
  disabled,
  editData,
}) => {
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  const generateDummySubjects = () => [
    { name: 'Mathematics', subjectCode: 'MTH101', subjectColor: '#42a5f5' },
    { name: 'Science', subjectCode: 'SCI101', subjectColor: '#66bb6a' },
    { name: 'English', subjectCode: 'ENG101', subjectColor: '#ef5350' },
    { name: 'Social Studies', subjectCode: 'SST101', subjectColor: '#ab47bc' },
    { name: 'Gujarati', subjectCode: 'GUJ101', subjectColor: '#ffa726' },
    { name: 'Computer', subjectCode: 'COMP101', subjectColor: '#26c6da' },
    { name: 'Art', subjectCode: 'ART101', subjectColor: '#8d6e63' },
    { name: 'General Knowledge', subjectCode: 'GK101', subjectColor: '#78909c' },
  ];

  const formik = useFormik<ISubjectFormValues>({
    initialValues: getNoOfLectureInitialValues(editData),
    enableReinitialize: true, // important when using useMemo
    validationSchema: noOfLectureValidationSchema,
    onSubmit: (values) => {
      // Calculate total lectures
      const totalLectures = values.subjects.reduce((sum, subject) => sum + subject.noOfLecture, 0);
      const submitData = {
        ...values,
        totalLectures,
      };
      if (editData) {
        shikshaMitraToast.success({
          message: `Weekly No of lectures updated for class ${values.className}`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Weekly No of lectures added for class ${values.className}`,
        });
      }
      onClose?.(null, true);
    },
  });

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
        <TextField
          type="number"
          size="small"
          label="Weekly Lectures *"
          name={`subjects[${index}].noOfLecture`}
          value={formik.values.subjects[index]?.noOfLecture ?? ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={disabled}
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
          sx={{ minWidth: '100px', width: '100%', mb: 1.5, mt: 0.3 }}
        />
      );
    },
    [
      formik.values.subjects,
      formik.handleChange,
      formik.handleBlur,
      formik.touched.subjects,
      formik.errors.subjects,
      disabled,
    ]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '450px' }}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={6}>
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
                    // isLoading={isLoading}
                    labelKey="name"
                    valueKey="name"
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.className && Boolean(formik.errors.className)}
                    helperText={
                      formik.touched.className && typeof formik.errors.className === 'string'
                        ? formik.errors.className
                        : undefined
                    }
                    disabled={disabled}
                  />
                </ShakingTextField>
              </Grid>
              {formik.values.className && (
                <Grid item xs={12}>
                  <CustomizableTable
                    tableId="table-subject-list"
                    isSearch={false}
                    isShowedDense={false}
                    isFilter={false}
                    columns={[
                      {
                        id: 'name',
                        label: 'Subject',
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
                </Grid>
              )}
            </Grid>
          </Scrollbar>
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
                type="submit"
                size="small"
                variant="contained"
              >
                {editData ? 'Update' : 'Submit'}
                {/* {isEdit ? 'Update' : 'Submit'} */}
              </Button>
              {/* <SubmitButton size="small" disabled={disabled} /> */}
            </DialogActions>
          )}
        </form>
      </Box>
    </BackPopUpChecked>
  );
};

export default CreateNoOfLecture;
