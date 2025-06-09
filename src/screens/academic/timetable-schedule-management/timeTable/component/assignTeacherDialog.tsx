'use client';

import React, { useState } from 'react';

import { Box, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssignTeacherProps } from './type';

const AssignTeacher: React.FC<IAssignTeacherProps> = ({
  teacherDialog,
  slotData,
  onTeacherSelect,
}) => {
  // State to store selected teacher value
  const [teacher, setTeacher] = useState<string>('');

  // Handler function to submit selected teacher
  const handleSubmit = () => {
    onTeacherSelect(teacher);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '25s0px' }}>
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
                      { id: '1', name: 'John Smith' },
                      { id: '2', name: 'Mary Johnson' },
                      { id: '3', name: 'David Williams' },
                      { id: '4', name: 'Sarah Brown' },
                      { id: '5', name: 'Michael Davis' },
                    ]}
                    value={row.teacherName}
                    onChange={(val) => {}}
                    formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  />
                ),

                // render: (row: any) => <TextField size="small" label={selectedSubCategory?.name} />,
              },
            ]}
            data={
              slotData.subjects.length > 1
                ? [
                    { id: 1, subjectName: 'English', teacherName: '1' },
                    { id: 2, subjectName: 'Hindi', teacherName: '2' },
                  ]
                : [{ id: 1, subjectName: 'Math', teacherName: '1' }]
            }
          />{' '}
        </Scrollbar>
        <DialogActions>
          <Button
            onClick={() => {
              teacherDialog.onFalse();
            }}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default AssignTeacher;
