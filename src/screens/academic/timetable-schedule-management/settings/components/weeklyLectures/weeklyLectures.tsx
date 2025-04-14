'use client';

import React from 'react';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import CreateNoOfLecture from './createWeeklyLectures';

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
        noDataText={
          <>
            No Create Number Of Lectures Found{' '}
            <Box
              onClick={() => {
                createLectureNumberDialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Create Number Of Lectures
            </Box>
          </>
        }
        columns={[
          { id: 'class', label: 'Class', filterType: 'number' },
          { id: 'totalLectures', label: 'Total Lectures', filterType: 'number' },
          {
            id: 'actions',
            label: 'Actions',
            minWidth: 100,
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
