'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetDeliveryChannelTypeOptionsQuery } from 'src/redux/communication/setting/deliveryChannelApi';

import DeliveryChannelTable from './Components/DelieveryChannelTypeTable';
import DeliveryChannelTypeForm from './Components/DeliveryChannelTypeForm';

import type { IDeliveryChannel } from './type';

const DeliveryChannelTypeCreation = () => {
  // Dialog control states
  const deleteDialog = useBoolean();
  const addDialog = useBoolean();
  const { data: deliveryChannelData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDeliveryChannelTypeOptionsQuery,
  });
  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedDeliveryChannelType, setSelectedDeliveryChannelType] =
    useState<IDeliveryChannel | null>(null);
  const dispatch = useDispatch();

  // Close handler
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedDeliveryChannelType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addDialog.onFalse();
      setTimeout(() => {
        setSelectedDeliveryChannelType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Delivery Channel Type"
        description="Manage delivery channel types such as Email, SMS, Push Notification, etc. Use actions to edit or delete existing types. Click ‘Add Delivery Channel Type’ to create a new one."
        links={[
          { name: 'Communication', href: '/communication/dashboard' },
          { name: 'Settings', href: '/communication/setting' },
          { name: 'Delivery Channel Type', href: '/communication/delivery-channel-type' },
        ]}
        action={
          <Button
            onClick={() => addDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Delivery Channel Type
          </Button>
        }
        sx={{ px: 1, mb: 1 }}
      />

      <DeliveryChannelTable
        onDelete={(data) => {
          setSelectedDeliveryChannelType(data);
          deleteDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedDeliveryChannelType(data);
          addDialog.onTrue();
        }}
        onAddDeliveryChannel={addDialog}
        setEditData={setSelectedDeliveryChannelType}
        data={deliveryChannelData} // Replace with actual data
      />

      <CustomDialog
        open={addDialog.value}
        handleClose={() => {
          addDialog.onFalse();
          setTimeout(() => {
            setSelectedDeliveryChannelType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedDeliveryChannelType
                ? 'Update Delivery Channel Type'
                : 'Add Delivery Channel Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedDeliveryChannelType
                  ? 'Update the delivery channel type details including name and description.'
                  : 'Create a new delivery channel type by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <DeliveryChannelTypeForm
          open={addDialog}
          onClose={handleClose}
          editData={selectedDeliveryChannelType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedDeliveryChannelType(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete delivery channel type{' '}
            <strong>{selectedDeliveryChannelType?.deliveryChannel}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteDialog.onFalse();
              setSelectedDeliveryChannelType(null);
              shikshaMitraToast.success({
                message: `Delivery Channel Type : ${selectedDeliveryChannelType?.deliveryChannel} deleted successfully`,
              });
              // handle delete API call here
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default DeliveryChannelTypeCreation;
