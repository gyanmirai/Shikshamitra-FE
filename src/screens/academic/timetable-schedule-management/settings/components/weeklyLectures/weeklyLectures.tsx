'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import CreateNoOfLecture from './createWeeklyLectures';

const WeeklyLectures = ({ addWeeklyLectureDialog }: any) => {
  // Dialog state to control the visibility of create lecture number dialog
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();
  const [isEdit, setIsEdit] = useState(false);
  // Custom boolean hook to control create lecture number dialog visibility
  // const addWeeklyLectureDialog = useBoolean();

  // State to control form field disabled status
  const [disabled, setDisabled] = React.useState(false);

  // Custom boolean hook to control view weekly lectures dialog visibility
  const viewWeeklyLecturesDialog = useBoolean();

  /**
   * Handles closing of the create lecture dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Close dialog if form submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addWeeklyLectureDialog.onFalse();
      dispatch(setIsChanges(false));
    }
    // Close dialog if no unsaved changes
    else if (!isChanges) {
      addWeeklyLectureDialog.onFalse();
    }
  };

  return (
    <Box>
      {/* <Box display="flex" gap={2} alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          startIcon={<Iconify icon="mdi:plus" />}
          variant="contained"
          size="small"
          onClick={addWeeklyLectureDialog.onTrue}
        >
          Weekly Lectures
        </Button>
      </Box> */}
      <CustomizableTable
        tableId="time-schedule-management-setting-table"
        searchFieldProps={{
          placeholder: 'Search by Class, Total Lectures...',
          label: 'Search by Class, Total Lectures...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={
          <>
            No Create Number Of Lectures Found{' '}
            <Box
              onClick={() => {
                addWeeklyLectureDialog.onTrue();
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
              Create Weekly Lectures
            </Box>
          </>
        }
        columns={[
          { id: 'class', label: 'Class', filterType: 'number' },
          { id: 'totalLectures', label: 'Total Lectures', filterType: 'number' },
          {
            id: 'actions',
            label: 'Actions',
            minWidth: 70,
            sticky: true,
            isSort: false,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...prop, row })}
                  showViewIcon
                  handleViewClick={() => {
                    viewWeeklyLecturesDialog.onTrue();
                    setDisabled(true);
                  }}
                  showEditIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setIsEdit(true);
                    addWeeklyLectureDialog.onTrue();
                  }}
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
        title={isEdit ? 'Update Weekly Lectures' : 'Add Weekly Lectures'}
        open={addWeeklyLectureDialog.value}
        handleClose={addWeeklyLectureDialog.onFalse}
        maxWidth="md"
      >
        <CreateNoOfLecture
          // onSave={handleSave}
          // dialogValue={dialog.value}
          onClose={handleClose}
          // data={selectedEntry}
          // isEdit={isEdit}
          // allData={roomData}
        />
      </CustomDialog>

      <CustomDialog
        title="View Number of Lectures"
        open={viewWeeklyLecturesDialog.value}
        handleClose={viewWeeklyLecturesDialog.onFalse}
        maxWidth="md"
      >
        <CreateNoOfLecture
          disabled={disabled}
          onClose={viewWeeklyLecturesDialog.onFalse}
          // onSave={handleSave}
          // dialogValue={dialog.value}
          // onClose={closeDialog}
          // data={selectedEntry}
          // isEdit={isEdit}
          // allData={roomData}
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
