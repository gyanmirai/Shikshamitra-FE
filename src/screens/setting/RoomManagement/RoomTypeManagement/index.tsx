'use client';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  roomTypeApi,
  useDeleteRoomTypeMutation,
} from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';
import { InstituteFieldFormattingPopover } from 'src/components/institute-field-formatting/institute-field-formatting-popover';

import RoomTypeForm from './components/roomTypeForm';
import RoomTypeTable from './components/roomTypeTable';

import type { IRoomType } from './types';

const RoomTypeManagement = () => {
  // Dialog control hooks for add/edit and delete room type modals
  const addRoomTypeDialog = useBoolean();
  const deleteRoomTypeDialog = useBoolean();
  const [deleteRoomType, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteRoomTypeMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();

  // State for managing selected room type and room type data
  const [selectedRoomType, setSelectedRoomType] = useState<IRoomType | null>(null);

  const handleClose = () => {
    addRoomTypeDialog.onFalse();
    setSelectedRoomType(null);
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Room Types"
        description="Define and organize room types to ensure effective facility management."
        links={[
          { name: 'Institute Setup', href: instituteSetupPaths.academicSetup },
          { name: 'Rooms & Buildings', href: instituteSetupPaths.roomsManagement.building },
          { name: 'Room Types' },
        ]}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <InstituteFieldFormattingPopover scope="roomTypes" />
            <Button
              variant="contained"
              onClick={addRoomTypeDialog.onTrue}
              startIcon={<Add />}
              size="small"
              sx={{
                width: '130px',
              }}
            >
              Room Type
            </Button>
          </Stack>
        }
      />

      {addRoomTypeDialog.value && (
        <RoomTypeForm open={addRoomTypeDialog} onClose={handleClose} editData={selectedRoomType} />
      )}

      <RoomTypeTable
        onDelete={(data) => {
          setSelectedRoomType(data);
          deleteRoomTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedRoomType(data);
          addRoomTypeDialog.onTrue();
        }}
      />

      <ConfirmDialog
        open={deleteRoomTypeDialog.value}
        disableBackdropClick
        onClose={() => {
          deleteRoomTypeDialog.onFalse();
          setSelectedRoomType(null);
        }}
        title="Delete Room Type"
        icon={<Iconify icon={GlobalIcons.delete} width={24} sx={{ color: 'error.main' }} />}
        content={
          <>
            Are you sure you want to delete{' '}
            <Box component="span" fontWeight="bold" color="text.primary">
              {selectedRoomType?.roomTypeName}
            </Box>
            ?
          </>
        }
        action={
          <LoadingButton
            type="button"
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            onClick={async () => {
              confirmWithUndo({
                item: selectedRoomType,
                message: `Room type "${selectedRoomType?.roomTypeName}" deleted successfully`,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    roomTypeApi.util.updateQueryData('getRoomTypes', undefined, (draft: any) => {
                      const targetArray = Array.isArray(draft) ? draft : draft?.items;
                      if (!targetArray) return;
                      const index = targetArray.findIndex(
                        (item: any) => item.id === selectedRoomType?.id
                      );
                      setDeleteIndex(index);
                      if (index !== -1) {
                        targetArray.splice(index, 1);
                      }
                    })
                  ),
                onUndoRestore: (dispatchFn, index) => {
                  dispatchFn(
                    roomTypeApi.util.updateQueryData('getRoomTypes', undefined, (draft: any) => {
                      const targetArray = Array.isArray(draft) ? draft : draft?.items;
                      if (!targetArray || index === -1) return;
                      targetArray.splice(index, 0, selectedRoomType);
                    })
                  );
                },
                onCommit: () => deleteRoomType(selectedRoomType?.id),
              });
              deleteRoomTypeDialog.onFalse();
              setSelectedRoomType(null);
            }}
          >
            Delete room type
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default RoomTypeManagement;
