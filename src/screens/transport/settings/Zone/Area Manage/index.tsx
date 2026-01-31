'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
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
  vehicleSettingsApi,
  useGetZoneAreaOptionsQuery,
  useDeleteZoneAreaOptionsMutation,
} from 'src/redux/transport/vehicle-management/vehicleSettingsApi';

import ZoneAreaForm from './Components/ZoneForm';
import ZoneAreaTable from './Components/ZoneAreaTable';

import type { IZoneArea } from './Components/type';

const ZoneAreaSettingScreen = () => {
  // Dialog control states
  const deleteZoneAreaDialog = useBoolean();
  const addZoneAreaDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected zone/area for edit/delete operations
  const [selectedZoneArea, setSelectedZoneArea] = useState<IZoneArea | null>(null);

  const dispatch = useDispatch();

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  // Delete mutation hook
  const { deleteZoneAreaOptions, isLoading: isDeleting } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteZoneAreaOptionsMutation,
  });

  const {
    data: zoneAreaData,
    isLoading: zoneAreaLoading,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetZoneAreaOptionsQuery,
  });

  /**
   * Handles closing of add/edit zone/area dialog
   */
  const handleClose = (_e: React.SyntheticEvent, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedZoneArea(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addZoneAreaDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addZoneAreaDialog.onFalse();
      setTimeout(() => setSelectedZoneArea(null), 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Zone/Area"
        description="Admins can manage and maintain transport zones or areas. It helps categorize routes and destinations efficiently for bus or van allocations."
        links={[
          { name: 'Transport', href: '/transport/dashboard' },
          { name: 'Settings', href: '/transport/settings/zoneArea' },
          { name: 'Zone/Area' },
        ]}
        action={
          <Button
            onClick={() => addZoneAreaDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Zone/Area
          </Button>
        }
      />
      <ZoneAreaTable
        data={zoneAreaData}
        isLoading={zoneAreaLoading}
        onDelete={(data) => {
          setSelectedZoneArea(data);
          deleteZoneAreaDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedZoneArea(data);
          addZoneAreaDialog.onTrue();
        }}
        open={open}
        onAddZoneArea={addZoneAreaDialog}
        setOpenDialog={setOpen}
        editData={selectedZoneArea}
        setEditData={setSelectedZoneArea}
      />

      <CustomDialog
        open={addZoneAreaDialog.value}
        handleClose={() => {
          addZoneAreaDialog.onFalse();
          setTimeout(() => setSelectedZoneArea(null), 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedZoneArea ? 'Update Zone/Area' : 'Add Zone/Area'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedZoneArea
                  ? 'Update existing zone or area name (e.g., Zone A, Area 1, East Route).'
                  : 'Create a new zone or area by entering its name (e.g., Zone A, Area 1, East Route).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ZoneAreaForm open={addZoneAreaDialog} onClose={handleClose} editData={selectedZoneArea} />
      </CustomDialog>

      <ConfirmDialog
        open={deleteZoneAreaDialog.value}
        onClose={() => {
          setSelectedZoneArea(null);
          deleteZoneAreaDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete zone/area <strong>{selectedZoneArea?.zoneName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            disabled={isDeleting}
            onClick={async () => {
              if (!selectedZoneArea?.id) return;

              confirmWithUndo({
                item: selectedZoneArea,
                message: `Zone/Area deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
                  dispatchFn(
                    vehicleSettingsApi.util.updateQueryData(
                      'getZoneAreaOptions',
                      undefined,
                      (draft: any) => {
                        const arr = Array.isArray(draft) ? draft : draft?.data;
                        if (!Array.isArray(arr)) return;

                        const index = arr.findIndex((item: any) => item.id === selectedZoneArea.id);
                        if (index !== -1) {
                          setDeleteIndex(index);
                          arr.splice(index, 1);
                        }
                      }
                    )
                  );
                },
                onUndoRestore: () => refetch(),
                onCommit: async () => {
                  await deleteZoneAreaOptions(selectedZoneArea.id);
                },
              });

              deleteZoneAreaDialog.onFalse();
              setSelectedZoneArea(null);
            }}
          >
            {isDeleting ? 'Deleting...' : 'Yes'}
          </Button>
        }
      />
    </Box>
  );
};

export default ZoneAreaSettingScreen;
