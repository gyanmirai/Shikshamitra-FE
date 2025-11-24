'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Button } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import AddFacilityForm from './facilityForm';

import type { IFacility } from './type';

const FacilitySetting = (props: TabComponentType) => {
  // Dialog state for facility form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();
  // State to manage form open/close
  const [, setOpen] = useState(false);
  // State to store selected facility entry
  const [selectedEntry, setSelectedEntry] = useState<IFacility | null>(null);
  const dispatch = useDispatch();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  /**
   * Handles closing of the facility form dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
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
          Facility
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Facility Found{' '}
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
              Add Facility
            </Box>
          </>
        }
        tableId="facility-setting-table"
        isShowedDense={false}
        isPagination={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'facilityName', label: 'Facility Name' },
          { id: 'description', label: 'Description' },
          {
            id: 'facilities',
            label: 'Facilities',
            render: (value) => (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {value.map((facility: string) => (
                  <Chip key={facility} label={facility} size="small" variant="outlined" />
                ))}
              </Box>
            ),
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
                handleDeleteClick={() => {
                  dialogForDeleteConfirmation.onTrue();
                }}
                showEditIcon
                handleEditClick={() => {
                  setSelectedEntry(row as IFacility);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            facilityName: 'Wi-Fi',
            description: 'High-speed internet access for residents.',
            facilities: ['Internet', '24/7 Access'],
          },
          {
            facilityName: 'Laundry',
            description: 'In-house laundry service for all hostel students.',
            facilities: ['Washer', 'Dryer', 'Detergent Provided'],
          },
          {
            facilityName: 'Gym',
            description: 'Equipped with modern fitness machines and weights.',
            facilities: ['Treadmill', 'Weights', 'Yoga Mats'],
          },
          {
            facilityName: 'Cafeteria',
            description: 'Healthy and hygienic meals served daily.',
            facilities: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
          },
          {
            facilityName: 'Library',
            description: 'Quiet study space with academic resources.',
            facilities: ['Books', 'Wi-Fi Zone', 'Reading Tables'],
          },
        ]}
      />

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={dialogForDeleteConfirmation.onFalse}
          title="Delete Item"
          content="Are you sure you want to delete this facility?"
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
        title={selectedEntry ? 'Edit Facility' : 'Add Facility'}
      >
        <AddFacilityForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>
      <Box pb="20px" />
    </>
  );
};

export default FacilitySetting;
