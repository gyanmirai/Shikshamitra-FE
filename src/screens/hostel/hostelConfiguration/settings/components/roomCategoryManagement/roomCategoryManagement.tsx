'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddRoomCategoryForm from './roomCategoryForm';

import type { IRoomCategory } from './type';

const RoomCategorySetting = (props: TabComponentType) => {
  // Dialog state for add/edit room category form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();
  // State to store selected room category for edit/delete operations
  const [selectedEntry, setSelectedEntry] = useState<IRoomCategory | null>(null);

  const dispatch = useDispatch();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles closing of the room category dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
      setSelectedEntry(null);
      dialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedEntry(null);
      dialog.onFalse();
    }
  };

  return (
    <>
      <Box gap={3} display="flex" justifyContent="flex-end" ml="auto">
        <Button
          startIcon={<Iconify icon="ic:outline-plus" />}
          onClick={() => {
            dialog.onTrue();
          }}
          variant="contained"
          size="small"
        >
          Room Category
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Room Category Found{' '}
            <Box
              onClick={() => dialog.onTrue()}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Room Category
            </Box>
          </>
        }
        tableId="room-category-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'hostelType', label: 'Hostel Type' },
          { id: 'hostelName', label: 'Hostel Name' },
          { id: 'categoryName', label: 'Category Name' },
          { id: 'maximumOccupancy', label: 'Max Occupancy' },
          {
            id: 'facilities',
            label: 'Facilities',
            render: (val) => (Array.isArray(val) ? val.join(', ') : '-'),
          },
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            sticky: true,
            align: 'right',
            minWidth: 40,
            render: (value, row) => (
              <ThreeDotsActions
                showThreeDots={false}
                showDeleteIcon
                handleDeleteClick={() => dialogForDeleteConfirmation.onTrue()}
                showEditIcon
                handleEditClick={() => {
                  setSelectedEntry(row as IRoomCategory);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            categoryName: 'Deluxe Room',
            maximumOccupancy: 2,
            facilities: ['Wi-Fi', 'Attached Bathroom', 'Study Table'],
          },
          {
            categoryName: 'Standard Room',
            maximumOccupancy: 4,
            facilities: ['Shared Bathroom', 'Fan', 'Cupboard'],
          },
        ]}
      />

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={dialogForDeleteConfirmation.onFalse}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Delete
            </LoadingButton>
          }
        />
      )}

      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setSelectedEntry(null);
        }}
        title={selectedEntry ? 'Edit Room Category' : 'Add Room Category'}
      >
        <AddRoomCategoryForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>
      <Box pb="20px" />
    </>
  );
};

export default RoomCategorySetting;
