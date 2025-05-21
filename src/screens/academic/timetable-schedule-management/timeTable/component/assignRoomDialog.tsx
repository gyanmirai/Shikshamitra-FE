'use client';

import React, { useState } from 'react';

import { Box, Button, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssignRoomProps } from './type';

const data = [
  {
    subjectName: 'Physics',
    teacherName: '', // You can map this to a default teacher ID or leave it blank for selection
  },
  {
    subjectName: 'Chemistry',
    teacherName: '',
  },
  {
    subjectName: 'Biology',
    teacherName: '',
  },
  {
    subjectName: 'Computer Science',
    teacherName: '',
  },
  {
    subjectName: 'Economics',
    teacherName: '',
  },
];

const AssignRoom: React.FC<IAssignRoomProps> = ({ selectedRoom, slotData, onRoomSelect }) => {
  // State to store the selected room value, initialized with selectedRoom prop or empty string
  const [room, setRoom] = useState<string>(selectedRoom || '');

  // State to store and manage the table data, initialized with default subject data
  const [tableData, setTableData] = useState(data);

  /**
   * Handles form submission by calling onRoomSelect callback with selected room value
   */
  const handleSubmit = () => {
    onRoomSelect(room);
  };

  /**
   * Updates the teacher assignment for a specific subject in the table data
   * @param subjectName - The name of the subject to update
   * @param newTeacherId - The ID of the newly assigned teacher
   */
  const handleTeacherChange = (subjectName: string, newTeacherId: any) => {
    setTableData((prev) =>
      prev.map((row) =>
        row.subjectName === subjectName ? { ...row, teacherName: newTeacherId } : row
      )
    );
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
          <CustomizableTable
            tableId="elective-subject-table"
            isFilter={false}
            isPagination={false}
            isSearch={false}
            noDataText={<>No Bulk Update Data Found </>}
            searchFieldProps={{
              placeholder: 'Search by Sr. No, GR No, Name',
              label: 'Search by Sr. No, GR No, Name',
              sx: {
                maxWidth: '400px',
                width: '100%',
              },
            }}
            columns={[
              { id: 'subjectName', label: 'Subject Name', minWidth: '200px', align: 'left' },
              {
                id: 'classRoom',
                label: 'Class Room',
                isSort: false,
                minWidth: '200px',
                align: 'left',
                isFilter: false,
                // renderColumn: (row: any) => <TextField size="small" label={headerLabel || 'hello'} />,
                // render: (value, row: any) => renderDynamicField({ value, row , selectedSubCategory}),
                render: (value, row: any) => (
                  <CustomSelect
                    label="Class Room"
                    labelKey="name"
                    valueKey="id"
                    options={[
                      { id: '1', name: 'Physics' },
                      { id: '2', name: 'Chemistry' },
                      { id: '3', name: 'Biology' },
                      { id: '4', name: 'Computer Science' },
                      { id: '5', name: 'Economics' },
                    ]}
                    value={row.teacherName}
                    onChange={(val) => handleTeacherChange(row.subjectName, val)}
                    formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  />
                ),

                // render: (row: any) => <TextField size="small" label={selectedSubCategory?.name} />,
              },
            ]}
            data={tableData}
          />
        </Scrollbar>
        <DialogActions>
          <Button onClick={handleSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default AssignRoom;
