import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Alert, Stack, Button, AlertTitle } from '@mui/material';
import { instituteSetupPermissions } from 'src/constants/institute-setup';

import type { FloorOption, BuildingOption } from '../types/room-form';

interface Props {
  building: BuildingOption;
  floor: FloorOption;
  disabled: boolean;
  onEdit: () => void;
}

export function RoomCapacityAlert({ building, floor, disabled, onEdit }: Props) {
  const permissions = useSelector((state: RootState) => state.auth?.permissions);
  const canEdit = hasGrantedPermission(
    permissions,
    `${instituteSetupPermissions.roomsManagement.building}.Add`
  );
  const hasCounts = Number.isInteger(floor.roomCount) && Number.isInteger(floor.totalRoom);
  return (
    <Alert severity="warning" sx={{ '& .MuiAlert-message': { width: 1, minWidth: 0 } }}>
      <AlertTitle>Room Limit Reached</AlertTitle>
      <Stack spacing={1} sx={{ overflowWrap: 'anywhere', alignItems: 'flex-start' }}>
        <span>
          {floor.floorName} in {building.buildingName}{' '}
          {hasCounts
            ? `already has ${floor.roomCount} ${floor.roomCount === 1 ? 'room' : 'rooms'}, with a limit of ${floor.totalRoom}.`
            : 'has reached its room limit.'}{' '}
          Increase Total rooms for this floor to add another room, or choose a different floor.
        </span>
        {canEdit ? (
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={disabled}
            startIcon={<Iconify icon={GlobalIcons.edit} />}
            onClick={onEdit}
          >
            Edit building
          </Button>
        ) : (
          <span>
            Ask a user with building management access to increase this floor&apos;s limit.
          </span>
        )}
      </Stack>
    </Alert>
  );
}
