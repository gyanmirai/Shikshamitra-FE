'use client';

import React, { useState } from 'react';

import { Box, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssignRoomProps } from './type';

const data = [
  {
    subjectName: 'Physics',
    teacherName: '', // You can map this to a default teacher ID or leave it blank for selection
  },
];

const AssignRoom: React.FC<IAssignRoomProps> = ({
  roomDialog,
  selectedRoom,
  slotData,
  onRoomSelect,
}) => {
  // State to store the selected room value, initialized with selectedRoom prop or empty string
  const [room, setRoom] = useState<string>(selectedRoom || '');
  console.log('slotData', slotData);

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
        <Scrollbar sx={{ p: 2, height: '200px' }}>
          <CustomizableTable
            tableId="Elective-subject-table"
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
              {
                id: 'subjectName',
                label: 'Subject Name',
                minWidth: '200px',
                align: 'left',
                isFilter: false,
              },
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
                      { id: '1', name: 'Room 101' },
                      { id: '2', name: 'Room 102' },
                      { id: '3', name: 'Room 103' },
                      { id: '4', name: 'Room 104' },
                      { id: '5', name: 'Room 105' },
                    ]}
                    value={row.teacherName}
                    onChange={(val) => handleTeacherChange(row.subjectName, val)}
                    formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  />
                ),

                // render: (row: any) => <TextField size="small" label={selectedSubCategory?.name} />,
              },
            ]}
            data={
              slotData.subjects.length > 1
                ? [
                    {
                      subjectName: 'English',
                      classRoom: '', // You can map this to a default teacher ID or leave it blank for selection
                    },
                    {
                      subjectName: 'Hindi',
                      classRoom: '', // You can map this to a default teacher ID or leave it blank for selection
                    },
                  ]
                : [
                    {
                      subjectName: 'Math',
                      classRoom: '', // You can map this to a default teacher ID or leave it blank for selection
                    },
                  ]
            }
          />
        </Scrollbar>
        <DialogActions>
          <Button
            onClick={() => {
              roomDialog.onFalse();
            }}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={handleSubmit}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default AssignRoom;
