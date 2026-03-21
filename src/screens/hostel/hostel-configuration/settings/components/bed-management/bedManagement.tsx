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

import AddBedNumberForm from './hostelBedForm';

import type { IHostelBed } from './type';

const BedNumberSetting = (props: TabComponentType) => {
  // Dialog state for the main modal
  const dialog = useBoolean();
  // Dialog state for delete confirmation modal
  const dialogForDeleteConfirmation = useBoolean();
  // State to manage modal open/close
  const [, setOpen] = useState(false);
  // State to store the selected bed entry
  const [selectedEntry, setSelectedEntry] = useState<IHostelBed | null>(null);

  const dispatch = useDispatch();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles the closing of the modal
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
            setOpen(true);
          }}
          variant="contained"
          size="small"
        >
          Bed
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Bed Number Found{' '}
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
              Add Bed
            </Box>
          </>
        }
        tableId="bed-number-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'bedNumber', label: 'Bed Number' },
          { id: 'hostelName', label: 'Hostel Name' },
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
                  setSelectedEntry(row as IHostelBed);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            bedNumber: 'B-101',
            hostelName: 'North Wing Hostel',
          },
          {
            bedNumber: 'B-202',
            hostelName: 'South Wing Hostel',
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
        title={selectedEntry ? 'Edit Bed' : 'Add Bed'}
      >
        <AddBedNumberForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>
      <Box pb="20px" />
    </>
  );
};

export default BedNumberSetting;
