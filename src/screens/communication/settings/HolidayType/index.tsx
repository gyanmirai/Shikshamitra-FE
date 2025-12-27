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
import { useGetHolidayTypeOptionsQuery } from 'src/redux/communication/setting/holidayTypeApi';

import HolidayTypeForm from './Components/HoliayTypeForm';
// Replace with actual API hook when available
import HolidayTypeTable from './Components/HolidayTypeTable';

import type { IHolidayType } from './type';

const HolidayTypeCreation = () => {
  // Custom hook to fetch holiday type data
  const { data: holidayTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHolidayTypeOptionsQuery,
  });

  // Dialog control states
  const deleteHolidayTypeDialog = useBoolean();
  const addHolidayTypeDialog = useBoolean();
  const [, setOpen] = useState(false);

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedHolidayType, setSelectedHolidayType] = useState<IHolidayType | null>(null);
  const dispatch = useDispatch();

  // Close handler
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedHolidayType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addHolidayTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addHolidayTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedHolidayType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Holiday Type"
        description="Manage holiday types such as National Holiday, Festival Holiday, Optional Holiday, etc. Use actions to edit or delete existing types. Click ‘Add Holiday Type’ to create a new one."
        links={[
          { name: 'Calendar', href: '/calendar/dashboard' },
          { name: 'Settings', href: '/communication/setting' },
          { name: 'Holiday Type', href: '/communication/holiday-type' },
        ]}
        action={
          <Button
            onClick={() => addHolidayTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Holiday Type
          </Button>
        }
        sx={{ px: 1, mb: 1 }}
      />

      <HolidayTypeTable
        onDelete={(data) => {
          setSelectedHolidayType(data);
          deleteHolidayTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedHolidayType(data);
          addHolidayTypeDialog.onTrue();
        }}
        onAddHolidayType={addHolidayTypeDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedHolidayType}
        data={holidayTypeData}
      />

      <CustomDialog
        open={addHolidayTypeDialog.value}
        handleClose={() => {
          addHolidayTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedHolidayType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedHolidayType ? 'Update Holiday Type' : 'Add Holiday Type'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedHolidayType
                  ? 'Update the holiday type details including name and description.'
                  : 'Create a new holiday type by entering its name and description.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <HolidayTypeForm
          open={addHolidayTypeDialog}
          onClose={handleClose}
          editData={selectedHolidayType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteHolidayTypeDialog.value}
        onClose={() => {
          setSelectedHolidayType(null);
          deleteHolidayTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete holiday type{' '}
            <strong>{selectedHolidayType?.holidayType}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteHolidayTypeDialog.onFalse();
              setSelectedHolidayType(null);
              shikshaMitraToast.success({
                message: `Holiday Type ${selectedHolidayType?.holidayType} deleted successfully`,
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

export default HolidayTypeCreation;
