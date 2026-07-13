import { Iconify } from 'src/components/iconify';
import { Box, Chip, Tooltip } from '@mui/material';

interface RoomSummary {
  roomId: string;
  roomName: string;
  occupied: number;
  usable: number;
}

interface Props {
  rooms: RoomSummary[];
  activeRoomId: string;
  onSwitch: (roomId: string) => void;
}

export default function RoomSwitcher({ rooms, activeRoomId, onSwitch }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1, px: 2, py: 1, overflowX: 'auto', borderBottom: '1px dashed', borderColor: 'divider' }}>
      {rooms.map((room) => {
        const full = room.usable > 0 && room.occupied >= room.usable;
        return (
          <Tooltip key={room.roomId} title={`${room.occupied}/${room.usable} seats used`}>
            <Chip
              clickable
              onClick={() => onSwitch(room.roomId)}
              icon={<Iconify icon={full ? 'mdi:door-closed' : 'mdi:door-open'} width={14} />}
              label={`${room.roomName} — ${room.occupied}/${room.usable}`}
              color={activeRoomId === room.roomId ? 'primary' : full ? 'success' : 'default'}
              variant={activeRoomId === room.roomId ? 'filled' : 'soft'}
              size="small"
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}
