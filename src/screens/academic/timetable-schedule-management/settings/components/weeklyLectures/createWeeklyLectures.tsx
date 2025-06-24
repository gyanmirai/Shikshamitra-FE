'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import weeklyLecturesTableData from 'src/json/academic/timetable/weeklyLecturesTableData.json';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

import { getNoOfLectureInitialValues } from './initialValues';
import { noOfLectureValidationSchema } from './validationSchema';

import type { ICreateNoOfLectureProps } from './type';

const CreateNoOfLecture: React.FC<ICreateNoOfLectureProps> = ({ open, onClose, disabled }) => {
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

  const formik = useFormik({
    initialValues: getNoOfLectureInitialValues(),
    validationSchema: noOfLectureValidationSchema,
    onSubmit: (values) => {},
  });

  // Initialize subject list state with default data
  const [subjectList, setSubjectList] = useState(weeklyLecturesTableData);

  /**
   * Handle changes to weekly lecture input fields
   * Updates the number of lectures for a specific subject
   * Ensures value is non-negative and converts string to number
   */
  const handleInputChange = (id: string, value: string) => {
    const numValue = Math.max(0, parseInt(value, 10) || 0);

    setSubjectList((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, weeklyLectures: numValue } : row))
    );
  };

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
                    value={formik.values.className || classes}
                    onChange={(val) => {
                      formik.setFieldValue('className', val as string);
                    }}
                    label="Class *"
                    // isLoading={isLoading}
                    labelKey="name"
                    valueKey="id"
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
              <Grid item xs={12} mb="-15px">
                <CustomizableTable
                  tableId="table-subject-list"
                  isSearch={false}
                  isShowedDense={false}
                  isFilter={false}
                  columns={[
                    {
                      id: 'subjects',
                      label: 'Subjects',
                      render: (value) => (
                        <Box sx={{ display: 'flex', gap: 0.9, flexWrap: 'wrap' }}>
                          {value.map((subject: any) => (
                            <Box
                              key={subject.name}
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                              <SubjectColorIndicator color={subject.subjectColor} />
                              <Typography variant="caption" fontSize="13px">
                                {subject.name}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      ),
                    },
                    {
                      id: 'weeklyLectures',
                      label: 'Weekly Lectures',
                      isSort: false,
                      isFilter: false,
                      render(value, row) {
                        return (
                          <TextField
                            type="number"
                            size="small"
                            label="Weekly Lectures *"
                            value={value}
                            onChange={(e) => handleInputChange(row.id, e.target.value)}
                            className="w-24"
                            disabled={disabled}
                            error={
                              formik.touched.weeklyLectures && Boolean(formik.errors.weeklyLectures)
                            }
                            helperText={
                              formik.touched.weeklyLectures && formik.errors.weeklyLectures
                                ? String(formik.errors.weeklyLectures)
                                : ''
                            }
                            inputProps={{
                              min: 0,
                              max: 100, // Set appropriate max value
                            }}
                            sx={{ minWidth: '200px', width: '100%' }}
                          />
                        );
                      },
                    },
                  ]}
                  data={subjectList}
                />
              </Grid>
            </Grid>
          </Scrollbar>
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
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              size="small"
              variant="contained"
            >
              Submit
              {/* {isEdit ? 'Update' : 'Submit'} */}
            </Button>
            {/* <SubmitButton size="small" disabled={disabled} /> */}
          </DialogActions>
        </form>
      </Box>
    </BackPopUpChecked>
  );
};

export default CreateNoOfLecture;
