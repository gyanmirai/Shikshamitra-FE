'use client';

import React, { useState } from 'react';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const WeeklyLectures = () => {
  // Dialog state to control the visibility of create lecture number dialog
  const createLectureNumberDialog = useBoolean();

  return (
    <Box>
      <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={createLectureNumberDialog.onTrue}
        >
          Create Number Of Lectures
        </Button>
      </Box>
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        columns={[
          { id: 'class', label: 'Class', filterType: 'number' },
          { id: 'totalLectures', label: 'Total Lectures', filterType: 'number' },
          {
            id: 'actions',
            label: 'Actions',
            sticky: true,
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showViewIcon
                  handleViewClick={() => {}}
                  showEditIcon
                  showThreeDots={false}
                  handleEditClick={() => {}}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={[
          {
            class: 1,
            totalLectures: 8,
          },
          {
            class: 2,
            totalLectures: 9,
          },
          {
            class: 3,
            totalLectures: 6,
          },
          {
            class: 4,
            totalLectures: 7,
          },
          {
            class: 5,
            totalLectures: 5,
          },
        ]}
      />

      <CustomDialog
        title="Create Number of Lectures"
        open={createLectureNumberDialog.value}
        handleClose={createLectureNumberDialog.onFalse}
        maxWidth="md"
      >
        <CreateNoOfLecture
        // onSave={handleSave}
        // dialogValue={dialog.value}
        // onClose={closeDialog}
        // data={selectedEntry}
        // isEdit={isEdit}
        // allData={roomData}
        />
      </CustomDialog>
    </Box>
  );
};

export default WeeklyLectures;

const initialData = [
  { id: 1, subjects: 'Mathematics', weeklyLectures: 0 },
  { id: 2, subjects: 'Science', weeklyLectures: 0 },
  { id: 3, subjects: 'English', weeklyLectures: 0 },
  { id: 4, subjects: 'History', weeklyLectures: 0 },
  { id: 5, subjects: 'Geography', weeklyLectures: 0 },
];

const CreateNoOfLecture = () => {
  // Fetch class data using custom hook
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // Initialize subject list state with default data
  const [subjectList, setSubjectList] = useState(initialData);

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
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
