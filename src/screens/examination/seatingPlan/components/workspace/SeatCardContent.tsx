import { Iconify } from 'src/components/iconify';
import { Box, Chip, Typography } from '@mui/material';

import type { SeatStateStyle } from './seat-card-types';
import type { SeatingSeat, SeatingAssignment } from '../../types';

interface Props {
  seat: SeatingSeat;
  assignment?: SeatingAssignment;
  studentName?: string;
  rollNo?: number;
  divisionName?: string;
  stateStyle: SeatStateStyle;
  isExternalExam: boolean;
  isSwapTarget: boolean;
  isPlaceTarget: boolean;
}

export default function SeatCardContent({
  seat,
  assignment,
  studentName,
  rollNo,
  divisionName,
  stateStyle,
  isExternalExam,
  isSwapTarget,
  isPlaceTarget,
}: Props) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{ color: stateStyle.color, lineHeight: 1 }}
        >
          #{seat.seatNumber}
        </Typography>
      </Box>
      {assignment ? (
        <Box
          sx={{ minWidth: 0, opacity: isSwapTarget ? 0.35 : 1, transition: 'opacity 150ms ease' }}
        >
          <Typography
            variant="caption"
            fontWeight={800}
            noWrap
            display="block"
            sx={{ color: stateStyle.color }}
          >
            {studentName || 'Student'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {rollNo != null && (
              <Typography
                variant="caption"
                color={isExternalExam ? 'text.disabled' : stateStyle.color}
                noWrap
                sx={{ lineHeight: 1.2 }}
              >
                Roll {rollNo}
              </Typography>
            )}
            {divisionName && (
              <Chip
                label={divisionName}
                size="small"
                sx={{ height: 14, fontSize: '0.55rem', px: 0.25 }}
              />
            )}
            {isExternalExam && !divisionName && rollNo == null && (
              <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: 1.2 }}>
                Other Exam
              </Typography>
            )}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: stateStyle.color,
            opacity: isPlaceTarget ? 0 : 1,
          }}
        >
          <Iconify
            icon={seat.isReserved ? 'mdi:lock-outline' : 'mdi:plus-circle-outline'}
            width={14}
          />
          <Typography variant="caption" fontWeight={700} sx={{ color: 'inherit' }}>
            {seat.isDisabled ? 'Disabled' : seat.isReserved ? 'Reserved' : 'Empty'}
          </Typography>
        </Box>
      )}
      {(isSwapTarget || isPlaceTarget) && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.25,
            borderRadius: 0.75,
            pointerEvents: 'none',
            color: isSwapTarget ? 'warning.darker' : 'primary.dark',
          }}
        >
          <Iconify
            icon={isSwapTarget ? 'mdi:swap-horizontal-bold' : 'mdi:tray-arrow-down'}
            width={22}
          />
          <Typography variant="caption" fontWeight={800} sx={{ color: 'inherit', lineHeight: 1 }}>
            {isSwapTarget ? 'Swap here' : 'Drop here'}
          </Typography>
        </Box>
      )}
    </>
  );
}
