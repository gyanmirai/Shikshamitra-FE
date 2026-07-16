'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Button, Switch, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusOptions,
} from 'src/enums/publishUnpublish-status';

import HostelPackageForm from './packageForm';

import type { IHostelPackageType } from './type';

const PackageManagement = (props: TabComponentType) => {
  // Dialog state for facility form
  const dialog = useBoolean();
  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();
  const publishDialog = useBoolean();
  // State to manage form open/close
  const [, setOpen] = useState(false);
  // State to store selected facility entry
  const [selectedEntry, setSelectedEntry] = useState<IHostelPackageType | null>(null);
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
      <Box gap={1} display="flex" justifyContent="flex-end" ml="auto">
        <Button
          startIcon={<Iconify icon="ic:outline-plus" />}
          onClick={() => {
            dialog.onTrue();
            setOpen(true);
          }}
          variant="contained"
          size="small"
        >
          Package
        </Button>
      </Box>

      <CustomizableTable
        noDataText={
          <>
            No Package Found{' '}
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
              Package
            </Box>
          </>
        }
        tableId="hostel-package-table"
        isShowedDense={false}
        columns={[
          { id: 'name', label: 'Package Name', minWidth: '150px', align: 'left' },
          { id: 'description', label: 'Description' },
          {
            id: 'amount',
            label: 'Amount',
            align: 'left',
            filterType: 'number',
            render(value, row) {
              return (
                <Typography
                  sx={{
                    fontSize: '12px',
                  }}
                >
                  {formatNumber(row.amount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'depositAmount',
            label: 'Deposit Amount',
            align: 'left',
            filterType: 'number',
            minWidth: '150px',
            render(value, row) {
              return (
                <Typography
                  sx={{
                    fontSize: '12px',
                  }}
                >
                  {formatNumber(row.depositAmount, 'INR')}
                </Typography>
              );
            },
          },
          { id: 'facilityGroup', label: 'Facility Group', minWidth: '150px', align: 'left' },
          { id: 'otherFacilities', label: 'Other Facilities', minWidth: '150px', align: 'left' },
          {
            id: 'scheduleDate',
            label: 'Schedule Date',
            filterType: 'date',
            minWidth: '150px',
            align: 'left',
          },
          {
            id: 'status',
            label: 'Publish',
            minWidth: '200px',
            align: 'left',
            filterType: 'enum',
            enumOptions: PublishUnpublishStatusOptions,
            render: (value: PublishUnpublishStatusType, row: any) => (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                  size="small"
                  checked={value === PublishUnpublishStatusType.Published}
                  onChange={() => {
                    setSelectedEntry(row as IHostelPackageType);
                    publishDialog.onTrue();
                  }}
                />
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
                  setSelectedEntry(row as IHostelPackageType);
                  setOpen(true);
                  dialog.onTrue();
                }}
              />
            ),
          },
        ]}
        data={[
          {
            name: 'Premium Package',
            description: 'All facilities with high-end amenities.',
            amount: 15000,
            depositAmount: 5000,
            facilityGroup: 'Wi-Fi, Laundry, Gym, Cafeteria, Library',
            otherFacilities: 'Air Conditioning, 24/7 Support',
            scheduleDate: '2025-06-01',
            status: 'Publish',
          },
          {
            name: 'Basic Package',
            description: 'Standard facilities with basic amenities.',
            amount: 8000,
            depositAmount: 3000,
            facilityGroup: 'Wi-Fi, Laundry',
            otherFacilities: '24/7 Support',
            scheduleDate: '2025-06-10',
            status: 'Draft',
          },
          {
            name: 'Economy Package',
            description: 'Affordable package with limited facilities.',
            amount: 5000,
            depositAmount: 2000,
            facilityGroup: 'Laundry, Cafeteria',
            otherFacilities: 'Shared Rooms',
            scheduleDate: '2025-07-01',
            status: 'Publish',
          },
          {
            name: 'Standard Package',
            description: 'Basic facilities with a focus on comfort.',
            amount: 10000,
            depositAmount: 4000,
            facilityGroup: 'Wi-Fi, Cafeteria, Library',
            otherFacilities: 'Shared Rooms',
            scheduleDate: '2025-06-15',
            status: 'Draft',
          },
        ]}
      />

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
            setSelectedEntry(null);
          }}
          title="Delete"
          content="Are you sure you want to delete this package?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Delete
            </LoadingButton>
          }
        />
      )}

      <ConfirmDialog
        open={publishDialog.value}
        onClose={() => {
          publishDialog.onFalse();
          setSelectedEntry(null);
        }}
        title="Publish"
        content="Are you sure you want to publish this package?"
        action={
          <LoadingButton variant="contained" loading={false} onClick={() => {}}>
            Delete
          </LoadingButton>
        }
      />

      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
          setSelectedEntry(null);
        }}
        title={selectedEntry ? 'Edit Package' : 'Add Package'}
      >
        <HostelPackageForm dialog={dialog} editData={selectedEntry} onClose={handleClose} />
      </CustomDialog>
      <Box pb="20px" />
    </>
  );
};

export default PackageManagement;
