import { Box, Typography } from '@mui/material';

import type { SeatStateStyle } from './seat-card-types';
import type { SeatingSeat, SeatingAssignment } from '../../types';

interface Props {
  seat: SeatingSeat;
  assignment?: SeatingAssignment;
  studentName?: string;
  rollNo?: number;
  divisionName?: string;
  isExternalExam: boolean;
  isSwapTarget: boolean;
  isPlaceTarget: boolean;
  stateStyle: SeatStateStyle;
}

export default function RoomStudioSeatContent({
  seat,
  assignment,
  studentName,
  rollNo,
  divisionName,
  isExternalExam,
  isSwapTarget,
  isPlaceTarget,
  stateStyle,
}: Props) {
  const unavailable = seat.isDisabled || isExternalExam;
  const status = isExternalExam
    ? 'Other plan'
    : seat.isDisabled
      ? 'Disabled'
      : seat.isReserved
        ? 'Reserved'
        : seat.isAccessible
          ? 'Accessible'
          : 'Empty';
  const figureColor = unavailable
    ? 'text.secondary'
    : assignment
      ? stateStyle.border
      : 'text.disabled';
  return (
    <>
      <Typography variant="caption" sx={{ alignSelf: 'flex-start', pr: 2 }}>
        Seat {seat.seatNumber}
      </Typography>
      <Box
        aria-hidden="true"
        sx={{
          my: 0.75,
          position: 'relative',
          width: 34,
          height: 32,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '50% 50% 4px 4px',
          bgcolor: 'background.paper',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 15,
            mt: 1,
            bgcolor: figureColor,
            borderRadius: '8px 8px 3px 3px',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -3,
              left: 11,
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: figureColor,
            },
          }}
        />
      </Box>
      <Typography
        variant="caption"
        fontWeight={600}
        noWrap
        sx={{ maxWidth: 1, color: unavailable ? 'text.secondary' : 'text.primary' }}
      >
        {isSwapTarget
          ? 'Swap here'
          : isPlaceTarget
            ? 'Drop here'
            : assignment
              ? studentName || 'Student'
              : status}
      </Typography>
      {assignment && (
        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 1 }}>
          {rollNo != null ? `Roll ${rollNo}` : ''}
          {divisionName ? ` · ${divisionName}` : ''}
        </Typography>
      )}
    </>
  );
}
