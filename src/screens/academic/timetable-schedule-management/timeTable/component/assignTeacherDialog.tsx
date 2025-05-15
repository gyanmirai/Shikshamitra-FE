'use client';

import React, { useState } from 'react';

import { Box, Button, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssignTeacherProps } from './type';

const AssignTeacher: React.FC<IAssignTeacherProps> = ({ slotData, onTeacherSelect }) => {
  // State to store selected teacher value
  const [teacher, setTeacher] = useState<string>('');

  // Handler function to submit selected teacher
  const handleSubmit = () => {
    onTeacherSelect(teacher);
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
              {
                id: 'subjectName',
                label: 'Subject Name',
                minWidth: '200px',
                align: 'left',
              },
              {
                id: 'teacherName',
                label: 'Teacher',
                isSort: false,
                minWidth: '200px',
                align: 'left',
                isFilter: false,
                // renderColumn: (row: any) => <TextField size="small" label={headerLabel || 'hello'} />,
                // render: (value, row: any) => renderDynamicField({ value, row , selectedSubCategory}),
                render: (value, row: any) => (
                  <CustomSelect
                    label="Teacher"
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
                    onChange={(val) => {}}
                    formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  />
                ),

                // render: (row: any) => <TextField size="small" label={selectedSubCategory?.name} />,
              },
            ]}
            data={[
              { id: 1, subjectName: 'Mathematics', teacherName: '1' },
              { id: 2, subjectName: 'English', teacherName: '2' },
              { id: 3, subjectName: 'Science', teacherName: '3' },
              { id: 4, subjectName: 'History', teacherName: '4' },
              { id: 5, subjectName: 'Geography', teacherName: '5' },
            ]}
          />{' '}
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

export default AssignTeacher;
