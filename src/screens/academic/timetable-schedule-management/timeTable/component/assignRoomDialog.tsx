'use client';

import React, { useState } from 'react';

import { Box, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IAssignRoomProps } from './type';

const data = [
  {
    subjectName: 'Physics',
    teacherName: '', // You can map this to a default teacher ID or leave it blank for selection
  },
];

const AssignRoom: React.FC<IAssignRoomProps> = ({
  roomDialog,
  slotData,
  onRoomSelect,
  onClose,
}) => {
  // State to store and manage the table data, initialized with slotData subjects
  const [tableData, setTableData] = useState(slotData.subjects);

  /**
   * Handles form submission by calling onRoomSelect callback with updated table data
   */
  const handleSubmit = () => {
    onRoomSelect({ ...slotData, subjects: tableData });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <BackPopUpChecked initialValues={slotData.subjects} currentValues={tableData}>
        <form onSubmit={handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '200px' }}>
            <CustomizableTable
              tableId="Elective-subject-table"
              isFilter={false}
              isPagination={false}
              isSearch={false}
              noDataText={<>No Bulk Update Data Found </>}
              columns={[
                {
                  id: 'subject',
                  label: 'Subject',
                  minWidth: '200px',
                  align: 'left',
                  isFilter: false,
                },
                {
                  id: 'room',
                  label: 'Class Room',
                  isSort: false,
                  minWidth: '200px',
                  align: 'left',
                  isFilter: false,
                  render: (value, row: any) => (
                    <CustomSelect
                      label="Class Room"
                      labelKey="name"
                      valueKey="id"
                      options={[
                        { id: '101', name: 'Room 101' },
                        { id: '102', name: 'Room 102' },
                        { id: '103', name: 'Room 103' },
                        { id: '104', name: 'Room 104' },
                        { id: '105', name: 'Room 105' },
                      ]}
                      value={row.room || ''}
                      onChange={(val) => {
                        setTableData((prev: any) =>
                          prev.map((subject: any) =>
                            subject.subject === row.subject ? { ...subject, room: val } : subject
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
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              onClick={handleSubmit}
              size="small"
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

export default AssignRoom;
