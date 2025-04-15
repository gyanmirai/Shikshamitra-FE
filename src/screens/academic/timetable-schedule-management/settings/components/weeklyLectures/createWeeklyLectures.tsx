'use client';

import React, { useState } from 'react';

import { Box, Grid, TextField, DialogActions } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import weeklyLecturesTableData from 'src/json/academic/timetable/weeklyLecturesTableData.json';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CustomizableTable from 'src/components/customizabaleTable';

import type { ICreateNoOfLectureProps } from './type';

const CreateNoOfLecture: React.FC<ICreateNoOfLectureProps> = ({ open }) => {
  // Fetch class data using custom hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize subject list state with default data
  const [subjectList, setSubjectList] = useState(weeklyLecturesTableData);

  /**
   * Handle changes to weekly lecture input fields
   * Updates the number of lectures for a specific subject
   * Ensures value is non-negative and converts string to number
   */
  const handleInputChange = (id: number, value: string) => {
    const numValue = Math.max(0, parseInt(value, 10) || 0);

    setSubjectList((prevData) =>
      prevData.map((row) => (row.id === id ? { ...row, weeklyLectures: numValue } : row))
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={() => {}}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '450px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomSelect
                options={classData?.items || []}
                value=""
                onChange={(val) => {
                  //   formik.setFieldValue('className', val as string);
                }}
                label="Class"
                // isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              />
              {/* {formik.touched.className && formik.errors.className && (
                <FormHelperText error>{formik.errors.className}</FormHelperText>
              )} */}
            </Grid>
            <Grid item xs={12}>
              <CustomizableTable
                tableId="table-subject-list"
                isSearch={false}
                isShowedDense={false}
                isFilter={false}
                columns={[
                  {
                    id: 'subjects',
                    label: 'Subjects',
                  },
                  {
                    id: 'weeklyLectures',
                    label: 'Weekly Lectures',
                    render(value, row) {
                      return (
                        <TextField
                          type="number"
                          size="small"
                          value={value}
                          onChange={(e) => handleInputChange(row.id, e.target.value)}
                          className="w-24"
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
        <DialogActions>
          <SubmitButton />
        </DialogActions>
      </form>
    </Box>
  );
};

export default CreateNoOfLecture;
