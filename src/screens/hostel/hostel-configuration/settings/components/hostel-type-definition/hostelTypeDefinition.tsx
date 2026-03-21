'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/useBoolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddHostelTypeForm from './hostelTypeForm';

import type { IHostelType } from './type';

const HostelTypeSetting = (props: TabComponentType) => {
  // Dialog state for managing the hostel type form dialog visibility
  const dialog = useBoolean();
  // Dialog state for managing the delete confirmation dialog visibility
  const dialogForDeleteConfirmation = useBoolean();
  // State to control the overall dialog open/close state
  const [, setOpen] = useState(false);
  // State to store the selected hostel type entry for editing
  const [selectedEntry, setSelectedEntry] = useState<IHostelType | null>(null);
  // useDispatch hook to dispatch actions
  const dispatch = useDispatch();
  // useSelector hook to access the isChanges state from the Redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  /**
   * Handles the closing of the room dialog.
   * @param _e - The event object.
   * @param isSubmit - A boolean indicating whether the form was submitted.
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
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
      <Box gap={3} display="flex" justifyContent="flex-end" alignContent="flex-end" ml="auto">
        <Button
          startIcon={<Iconify icon="ic:outline-plus" />}
          onClick={() => {
            dialog.onTrue();
            setOpen(true);
          }}
          variant="contained"
          size="small"
        >
          Hostel Type
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Hostel Type Found{' '}
            <Box
              onClick={() => {
                setOpen(true);
                dialog.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Hostel Type
            </Box>
          </>
        }
        tableId="hostel-type-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'hostelTypeName', label: 'Hostel Type' },
          { id: 'description', label: 'Description' },
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
                handleDeleteClick={() => {
                  dialogForDeleteConfirmation.onTrue();
                }}
                showEditIcon
                handleEditClick={() => {
                  setSelectedEntry(row as IHostelType);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            hostelTypeName: 'Executive Hostel',
            description: 'Designed for staff and faculty accommodations.',
          },
          {
            hostelTypeName: 'Student Hostel',
            description: 'General purpose hostel for enrolled students.',
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
              Yes
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
        title={selectedEntry ? 'Edit Hostel Type' : 'Add Hostel Type'}
      >
        <AddHostelTypeForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>
      <Box pb="20px" />
    </>
  );
};

export default HostelTypeSetting;
