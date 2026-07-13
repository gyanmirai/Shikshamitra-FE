import { useDraggable } from '@dnd-kit/core';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Avatar, Checkbox, Typography } from '@mui/material';

import type { SeatingStudent, SeatingAssignment } from '../../types';

interface Props {
  student: SeatingStudent;
  assignment?: SeatingAssignment;
  isMultiSelected?: boolean;
  onToggleMultiSelect?: (studentId: string) => void;
  showCheckbox?: boolean;
  isReadOnly?: boolean;
}

export default function StudentCard({
  student,
  assignment,
  isMultiSelected,
  onToggleMultiSelect,
  showCheckbox,
  isReadOnly,
}: Props) {
  const isAllocated = !!assignment;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `student:${student.studentId}`,
    data: { type: 'student', student },
    disabled: isAllocated || isReadOnly,
  });

  return (
    <Box
      ref={setNodeRef}
      {...(isAllocated || isReadOnly ? {} : listeners)}
      {...(isAllocated || isReadOnly ? {} : attributes)}
      role="button"
      tabIndex={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: isAllocated ? 'action.hover' : 'background.paper',
        cursor: isAllocated || isReadOnly ? 'default' : 'grab',
        opacity: isDragging ? 0.4 : isAllocated ? 0.75 : 1,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        '&:hover': { borderColor: isAllocated ? 'divider' : 'primary.main' },
      }}
    >
      {showCheckbox && (
        <Checkbox
          size="small"
          checked={!!isMultiSelected}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onToggleMultiSelect?.(student.studentId)}
          sx={{ p: 0 }}
        />
      )}
      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0 }}>
        {student.studentName?.charAt(0)?.toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {student.studentName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          Roll {student.rollNo}
          {student.divisionName ? ` · ${student.divisionName}` : ''}
        </Typography>
      </Box>
      {student.hasSpecialRequirement && (
        <Chip
          size="small"
          color="info"
          variant="soft"
          icon={<Iconify icon="mdi:star-outline" width={12} />}
          label="Special"
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      )}
      {assignment && (
        <Chip
          size="small"
          color="success"
          variant="soft"
          label={`Seat ${assignment.seatNumber}`}
          sx={{ height: 20, fontSize: '0.65rem' }}
        />
      )}
    </Box>
  );
}
