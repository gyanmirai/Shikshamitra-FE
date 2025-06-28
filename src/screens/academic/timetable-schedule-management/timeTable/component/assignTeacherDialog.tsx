'use client';

import React, { useState } from 'react';

import { Box, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { Subject } from '../type';
import type { IAssignTeacherProps } from './type';

const AssignTeacher: React.FC<IAssignTeacherProps> = ({
  teacherDialog,
  slotData,
  onTeacherSelect,
  onClose,
}) => {
  // Initialize with subject data from slotData
  const [tableData, setTableData] = useState(slotData.subjects || []);

  // Handler function to submit updated teacher assignments
  const handleSubmit = () => {
    onTeacherSelect({ ...slotData, subjects: tableData });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <BackPopUpChecked initialValues={slotData.subjects} currentValues={tableData}>
        <form onSubmit={handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '200px' }}>
            <CustomizableTable
              tableId="assign-teacher-table"
              isFilter={false}
              isPagination={false}
              isSearch={false}
              noDataText={<>No Data Found</>}
              columns={[
                {
                  id: 'subject',
                  label: 'Subject',
                  minWidth: '200px',
                  align: 'left',
                  isFilter: false,
                },
                {
                  id: 'teacher',
                  label: 'Teacher',
                  isSort: false,
                  minWidth: '200px',
                  align: 'left',
                  isFilter: false,
                  render: (value, row: any) => (
                    <CustomSelect
                      label="Teacher"
                      labelKey="name"
                      valueKey="id"
                      options={[
                        { id: 'Sharma Rajesh Kumar', name: 'Sharma Rajesh Kumar' },
                        { id: 'Patel Priya Dinesh', name: 'Patel Priya Dinesh' },
                        { id: 'Singh Amit Raj', name: 'Singh Amit Raj' },
                        { id: 'Gupta Neha Anil', name: 'Gupta Neha Anil' },
                        { id: 'Kumar Suresh Mohan', name: 'Kumar Suresh Mohan' },
                      ]}
                      value={row.teacher || ''}
                      onChange={(val) => {
                        setTableData((prev: Subject) =>
                          prev.map((subject: Subject) =>
                            subject.subject === row.subject ? { ...subject, teacher: val } : subject
                          )
                        );
                      }}
                      formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                    />
                  ),
                },
              ]}
              data={tableData}
            />
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              onClick={() => {
                onClose?.(null, false);
              }}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              variant="contained"
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignTeacher;
