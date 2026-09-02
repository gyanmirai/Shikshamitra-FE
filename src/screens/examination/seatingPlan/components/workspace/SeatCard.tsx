import { Iconify } from 'src/components/iconify';
import { Box, Tooltip, IconButton } from '@mui/material';
import { usePopover } from 'src/components/custom-popover';

import SeatActionMenu from './SeatActionMenu';
import SeatCardSurface from './SeatCardSurface';

import type { SeatCardProps } from './seat-card-types';

export default function SeatCard({
  seat,
  roomId,
  assignment,
  studentName,
  rollNo,
  divisionName,
  isConflict,
  isExternalExamOccupied: propIsExternalExam,
  onClick,
  onRemove,
  onReserve,
  isReadOnly,
}: SeatCardProps) {
  const isExternalExam =
    propIsExternalExam || !!assignment?.isExternalExamOccupied || !!seat.isExternalExamOccupied;
  const popover = usePopover();

  const tooltipTitle = popover.open
    ? ''
    : isExternalExam
      ? 'Blocked (Other Exam)'
      : assignment
        ? `${studentName ?? 'Student'} - Seat ${seat.seatNumber}`
        : seat.isReserved
          ? `Reserved Seat #${seat.seatNumber} (Excluded from allocation)`
          : seat.isDisabled
            ? `Disabled Seat #${seat.seatNumber}`
            : isReadOnly
              ? `Seat ${seat.seatNumber}`
              : `Drop a student on seat ${seat.seatNumber}`;

  return (
    <Tooltip title={tooltipTitle} arrow enterDelay={500}>
      <Box sx={{ position: 'relative', minWidth: 0 }}>
        <SeatCardSurface
          seat={seat}
          roomId={roomId}
          assignment={assignment}
          studentName={studentName}
          rollNo={rollNo}
          divisionName={divisionName}
          isConflict={isConflict}
          isExternalExam={isExternalExam}
          isReadOnly={isReadOnly}
          onClick={onClick}
        />
        {!isReadOnly && (
          <>
            <IconButton
              size="small"
              aria-label={`Seat ${seat.seatNumber} actions`}
              disabled={isExternalExam}
              sx={{ position: 'absolute', top: 4, right: 4, zIndex: 3, p: 0.25 }}
              onClick={(event) => {
                if (isExternalExam) return;
                popover.onOpen(event);
              }}
            >
              <Iconify icon="eva:more-vertical-fill" width={14} />
            </IconButton>
            <SeatActionMenu
              popover={popover}
              hasStudent={!!assignment && !isExternalExam}
              isReserved={seat.isReserved}
              onRemove={() => !isExternalExam && onRemove?.()}
              onReserve={() => !isExternalExam && onReserve?.()}
            />
          </>
        )}
      </Box>
    </Tooltip>
  );
}
