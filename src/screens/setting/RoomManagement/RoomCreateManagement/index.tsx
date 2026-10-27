'use client';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { InstituteFieldFormattingPopover } from 'src/components/institute-field-formatting/institute-field-formatting-popover';

import RoomTable from './components/roomTable';
import RoomForm from './components/AddRoomForm';
import { useRoomDeletion } from './hooks/use-room-deletion';

import type { IRoom } from './types';

export default function RoomCreateManagement() {
  const form = useBoolean();
  const deletion = useRoomDeletion();
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const handleClose = () => {
    form.onFalse();
    setSelectedRoom(null);
  };
  return (
    <Box
      sx={{
        height: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CustomBreadcrumbs
        heading="Rooms"
        description="Create and manage rooms for effective facility management."
        links={[
          { name: 'Institute Setup', href: instituteSetupPaths.academicSetup },
          { name: 'Rooms & Buildings', href: instituteSetupPaths.roomsManagement.building },
          { name: 'Rooms' },
        ]}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <InstituteFieldFormattingPopover scope="rooms" />
            <Button
              variant="contained"
              onClick={form.onTrue}
              startIcon={<Add />}
              size="small"
              sx={{
                width: '130px',
              }}
            >
              Add room
            </Button>
          </Stack>
        }
      />
      {form.value && <RoomForm open={form} onClose={handleClose} editData={selectedRoom} />}
      <RoomTable
        onDelete={deletion.requestDelete}
        onEdit={(room) => {
          setSelectedRoom(room);
          form.onTrue();
        }}
      />
      <ConfirmDialog
        open={Boolean(deletion.selection)}
        disableBackdropClick
        onClose={deletion.close}
        title="Delete Room?"
        content={
          <>
            Are you sure you want to delete room{' '}
            <strong>{deletion.selection?.room.roomName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={deletion.isLoading}
            variant="contained"
            color="error"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={deletion.remove}
          >
            Delete room
          </LoadingButton>
        }
      />
    </Box>
  );
}
