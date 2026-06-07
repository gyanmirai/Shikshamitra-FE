'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  holidayApi,
  useGetHolidayTypeQuery,
  useDeleteHolidayTypeMutation,
} from 'src/redux/communication/holiday/holidayDataApi';

import HolidayTypeForm from './Components/HoliayTypeForm';
import HolidayTypeTable from './Components/HolidayTypeTable';

import type { IHolidayType } from './type';

const HolidayTypeCreation = () => {
  const {
    data: holidayTypeData,
    refetch,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHolidayTypeQuery,
  });

  const deleteHolidayTypeDialog = useBoolean();
  const addHolidayTypeDialog = useBoolean();
  const [, setOpen] = useState(false);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedHolidayType, setSelectedHolidayType] = useState<IHolidayType | null>(null);
  const dispatch = useDispatch();

  const [deleteHolidayType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteHolidayTypeMutation,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

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
        description="Manage holiday types such as national holiday, festival holiday, and optional holiday. Use actions to edit or delete existing types."
        links={[
          { name: 'Calendar', href: '/calendar/dashboard' },
          { name: 'Settings', href: '/calendar/setting/holidayType' },
          { name: 'Holiday Type' },
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
        sx={{ px: 1 }}
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
        data={holidayTypeData?.items || []}
        isLoading={isLoading || isFetching}
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
            <strong>{selectedHolidayType?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedHolidayType,
                message: `Holiday type: ${selectedHolidayType?.name} deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    holidayApi.util.updateQueryData('getHolidayType', undefined, (draft: any) => {
                      const index = draft?.items?.findIndex(
                        (item: any) => item.id === selectedHolidayType?.id
                      );
                      setDeleteIndex(index);
                      if (index !== -1 && draft) {
                        draft.items.splice(index, 1);
                      }
                    })
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () =>
                  selectedHolidayType?.id
                    ? deleteHolidayType(selectedHolidayType.id)
                    : Promise.resolve(),
              });
              deleteHolidayTypeDialog.onFalse();
              setSelectedHolidayType(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default HolidayTypeCreation;
