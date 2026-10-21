import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { ALL_ROOMS_FILTER } from '../types/room-table';

import type { RoomBuildingOption } from '../types/room-table';

interface Props {
  buildings: RoomBuildingOption[];
  buildingId: string;
  floorId: string;
  disabled: boolean;
  onBuildingChange: (id: string) => void;
  onFloorChange: (id: string) => void;
  onClear: () => void;
}

export default function RoomTableFilters({
  buildings,
  buildingId,
  floorId,
  disabled,
  onBuildingChange,
  onFloorChange,
  onClear,
}: Props) {
  const floors = buildings.find((building) => building.id === buildingId)?.floors ?? [];
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        px: 1,
        py: 0.5,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1,
          width: { xs: 1, sm: 520 },
          maxWidth: 1,
        }}
      >
        <TextField
          select
          fullWidth
          size="small"
          label="Building"
          value={buildingId}
          disabled={disabled}
          onChange={(event) => onBuildingChange(event.target.value)}
        >
          <MenuItem value={ALL_ROOMS_FILTER}>All Buildings</MenuItem>
          {buildings.map((building) => (
            <MenuItem key={building.id} value={building.id}>
              {building.buildingName}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          size="small"
          label="Floor"
          value={floorId}
          disabled={disabled || buildingId === ALL_ROOMS_FILTER}
          onChange={(event) => onFloorChange(event.target.value)}
        >
          <MenuItem value={ALL_ROOMS_FILTER}>All Floors</MenuItem>
          {floors.map((floor) => (
            <MenuItem key={floor.id} value={floor.id}>
              {floor.floorName || `Floor ${floor.floorNo}`}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      {buildingId !== ALL_ROOMS_FILTER && (
        <Button size="small" color="inherit" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </Box>
  );
}
