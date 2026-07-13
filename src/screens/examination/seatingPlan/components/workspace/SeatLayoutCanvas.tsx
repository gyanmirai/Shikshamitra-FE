import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useCallback } from 'react';
import {
  DragOverlay,
  useDndContext,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from '@dnd-kit/core';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Avatar,
  Button,
  Divider,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';

import SeatCard from './SeatCard';

import type {
  SeatingSeat,
  SeatingStudent,
  SeatingAssignment,
  SeatingRoomLayout,
} from '../../types';

interface Props {
  room: SeatingRoomLayout;
  assignments: SeatingAssignment[];
  studentsById: Map<string, SeatingStudent>;
  conflictSeatIds: Set<string>;
  onAssign: (student: SeatingStudent, roomId: string, seat: SeatingSeat) => void;
  onUnassign: (studentId: string) => void;
  onToggleReserve?: (roomId: string, seat: SeatingSeat) => void;
  isReadOnly?: boolean;
}

export default function SeatLayoutCanvas({
  room,
  assignments,
  studentsById,
  conflictSeatIds,
  onAssign,
  onUnassign,
  onToggleReserve,
  isReadOnly,
}: Props) {
  const { active, over } = useDndContext();
  const [zoom, setZoom] = useState(1);
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);


  const assignmentBySeat = useMemo(() => {
    const map = new Map<string, SeatingAssignment>();
    assignments.forEach((a) => {
      if (a.roomId === room.roomId) map.set(a.seatId, a);
    });
    return map;
  }, [assignments, room.roomId]);

  const seatByRow = useMemo(() => {
    const rows = new Map<number, SeatingSeat[]>();
    room.seats.forEach((s) => {
      rows.set(s.row, [...(rows.get(s.row) ?? []), s].sort((a, b) => a.column - b.column));
    });
    return [...rows.entries()].sort(([a], [b]) => a - b);
  }, [room.seats]);

  const roomShape = useMemo(() => {
    const rowCount = Math.max(room.rows, ...room.seats.map((seat) => seat.row + 1), 0);
    const columnCount = Math.max(room.columns, ...room.seats.map((seat) => seat.column + 1), 0);
    const assignedInRoom = assignments.filter((assignment) => assignment.roomId === room.roomId).length;
    const usableSeats = room.seats.filter((seat) => !seat.isDisabled).length || room.capacity;
    const groupedRows = seatByRow.map(([rowIndex, seatsInRow]) => {
      const byColumn = new Map<number, SeatingSeat[]>();
      seatsInRow.forEach((seat) => {
        byColumn.set(seat.column, [...(byColumn.get(seat.column) ?? []), seat]);
      });

      return {
        rowIndex,
        benches: Array.from({ length: columnCount }, (_, columnIndex) => ({
          columnIndex,
          seats: (byColumn.get(columnIndex) ?? []).sort((a, b) => a.seatNumber - b.seatNumber),
        })),
      };
    });

    return { rowCount, columnCount, assignedInRoom, usableSeats, groupedRows };
  }, [assignments, room, seatByRow]);

  const gridTemplateColumns = `64px repeat(${Math.max(roomShape.columnCount, 1)}, minmax(${
    room.benchCapacity > 1 ? 176 : 122
  }px, 1fr))`;


  const handleSeatClick = (seat: SeatingSeat) => {
    setFocusedSeatId(seat.seatId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focusedSeatId) return;
    const flat = room.seats;
    const idx = flat.findIndex((s) => s.seatId === focusedSeatId);
    if (idx === -1) return;
    const current = flat[idx];

    const findNeighbour = (dRow: number, dCol: number) =>
      flat.find((s) => s.row === current.row + dRow && s.column === current.column + dCol);

    if (e.key === 'ArrowRight') setFocusedSeatId(findNeighbour(0, 1)?.seatId ?? focusedSeatId);
    if (e.key === 'ArrowLeft') setFocusedSeatId(findNeighbour(0, -1)?.seatId ?? focusedSeatId);
    if (e.key === 'ArrowDown') setFocusedSeatId(findNeighbour(1, 0)?.seatId ?? focusedSeatId);
    if (e.key === 'ArrowUp') setFocusedSeatId(findNeighbour(-1, 0)?.seatId ?? focusedSeatId);
    if (e.key === 'Enter') handleSeatClick(current);
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (isReadOnly) return;
      const existing = assignmentBySeat.get(current.seatId);
      if (existing) onUnassign(existing.studentId);
    }
    if (e.key === 'Escape') setFocusedSeatId(null);
  };

  const dropAnimation: DropAnimation = useCallback(
    (args) => {
      const { dragOverlay, droppableContainers, transform } = args;
      const cleanup = defaultDropAnimationSideEffects({ styles: { active: { opacity: '0' } } })(args);

      const overNode = over ? droppableContainers.get(over.id)?.node.current : null;
      const overRect = overNode?.getBoundingClientRect();

      // Land the overlay on the seat it was dropped onto instead of flying
      // back to where the drag started (dnd-kit's default behaviour).
      const [endX, endY] = overRect
        ? [
            transform.x + overRect.left + overRect.width / 2 - (dragOverlay.rect.left + dragOverlay.rect.width / 2),
            transform.y + overRect.top + overRect.height / 2 - (dragOverlay.rect.top + dragOverlay.rect.height / 2),
          ]
        : [0, 0];

      const animation = dragOverlay.node.animate(
        [
          { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` },
          { transform: `translate3d(${endX}px, ${endY}px, 0)` },
        ],
        { duration: 220, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' }
      );

      return animation.finished.then(cleanup);
    },
    [over]
  );

  const dragGhost = useMemo(() => {
    const data = active?.data.current as
      | { type: 'student'; student?: SeatingStudent }
      | { type: 'assigned-seat'; assignment?: SeatingAssignment; seat?: SeatingSeat }
      | undefined;
    if (!data) return null;
    if (data.type === 'student' && data.student) {
      return { name: data.student.studentName, rollNo: data.student.rollNo, seatNumber: undefined };
    }
    if (data.type === 'assigned-seat' && data.assignment) {
      const student = studentsById.get(data.assignment.studentId);
      return { name: student?.studentName ?? 'Student', rollNo: student?.rollNo, seatNumber: data.seat?.seatNumber };
    }
    return null;
  }, [active, studentsById]);


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 1.5,
          mb: 1,
          px: 1,
          flexWrap: 'wrap',
        }}
      >
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            icon={<Iconify icon="mdi:door-open" width={14} />}
            label={room.roomName}
            size="small"
            color="primary"
            variant="soft"
          />
          <Chip
            icon={<Iconify icon="mdi:grid" width={14} />}
            label={`${roomShape.rowCount} rows x ${roomShape.columnCount} columns`}
            size="small"
            variant="outlined"
          />
          <Chip
            icon={<Iconify icon="mdi:seat-outline" width={14} />}
            label={`${roomShape.assignedInRoom}/${roomShape.usableSeats} seats`}
            size="small"
            color={roomShape.assignedInRoom > roomShape.usableSeats ? 'error' : 'default'}
            variant="outlined"
          />
          {room.benchCapacity > 1 && (
            <Chip
              icon={<Iconify icon="mdi:table-furniture" width={14} />}
              label={`${room.benchCapacity} seats per bench`}
              size="small"
              variant="outlined"
            />
          )}
          {room.entrancePosition && (
            <Chip
              icon={<Iconify icon="mdi:door" width={14} />}
              label={`Entrance: ${room.entrancePosition}`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Zoom out">
            <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}>
              <Iconify icon="mdi:magnify-minus-outline" width={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset zoom">
            <IconButton size="small" onClick={() => setZoom(1)}>
              <Iconify icon="mdi:fit-to-page-outline" width={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom in">
            <IconButton size="small" onClick={() => setZoom((z) => Math.min(1.35, z + 0.1))}>
              <Iconify icon="mdi:magnify-plus-outline" width={16} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>



        <Box
          onKeyDown={handleKeyDown}
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
            p: 1.25,
          }}
        >
          <Box
            sx={{
              minWidth: 'max-content',
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 120ms ease',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns,
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <Box />
              <Box
                sx={{
                  gridColumn: `span ${Math.max(roomShape.columnCount, 1)}`,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'primary.light',
                  bgcolor: 'primary.lighter',
                  color: 'primary.darker',
                  py: 0.75,
                  px: 1.5,
                  textAlign: 'center',
                  fontWeight: 800,
                  letterSpacing: 0,
                }}
              >
                <Iconify icon="mdi:presentation" width={16} sx={{ mr: 0.75, verticalAlign: 'text-bottom' }} />
                Board / Front
              </Box>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns,
                gap: 1,
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700} textAlign="right">
                Row
              </Typography>
              {Array.from({ length: Math.max(roomShape.columnCount, 1) }, (_, index) => (
                <Box
                  key={index}
                  sx={{
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    py: 0.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Column {index + 1}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Stack spacing={1}>
              {roomShape.groupedRows.map(({ rowIndex, benches }) => (
                <Box
                  key={rowIndex}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns,
                    gap: 1,
                    alignItems: 'stretch',
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 92,
                    }}
                  >
                    <Typography variant="caption" fontWeight={800} color="text.secondary">
                      Row {String.fromCharCode(65 + rowIndex)}
                    </Typography>
                  </Box>

                  {benches.map(({ columnIndex, seats }) => {
                    const isAisleAfter = room.aisleAfterColumns?.includes(columnIndex);

                    return (
                      <Box
                        key={`${rowIndex}-${columnIndex}`}
                        sx={{
                          position: 'relative',
                          minHeight: 92,
                          p: 0.75,
                          borderRadius: 1.25,
                          border: '1px solid',
                          borderColor: isAisleAfter ? 'primary.light' : 'divider',
                          borderRightWidth: isAisleAfter ? 3 : 1,
                          bgcolor: 'background.paper',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.75,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            Bench {columnIndex + 1}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {seats.length || room.benchCapacity} seats
                          </Typography>
                        </Stack>

                        {seats.length === 0 ? (
                          <Box
                            sx={{
                              flex: 1,
                              borderRadius: 1,
                              border: '1px dashed',
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" color="text.disabled">
                              No bench
                            </Typography>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: `repeat(${Math.min(seats.length, 2)}, minmax(0, 1fr))`,
                              gap: 0.75,
                            }}
                          >
                            {seats.map((seat) => {
                              const assignment = assignmentBySeat.get(seat.seatId);
                              const student = assignment ? studentsById.get(assignment.studentId) : undefined;

                              return (
                                <SeatCard
                                  key={seat.seatId}
                                  seat={seat}
                                  roomId={room.roomId}
                                  assignment={assignment}
                                  studentName={student?.studentName}
                                  rollNo={student?.rollNo}
                                  divisionName={student?.divisionName}
                                  isConflict={conflictSeatIds.has(seat.seatId)}
                                  onClick={() => handleSeatClick(seat)}
                                  onRemove={() => assignment && onUnassign(assignment.studentId)}
                                  onReserve={() => onToggleReserve?.(room.roomId, seat)}
                                  isReadOnly={isReadOnly}
                                />
                              );
                            })}
                          </Box>
                        )}
                        {isAisleAfter && (
                          <Typography
                            variant="caption"
                            color="primary.main"
                            sx={{ position: 'absolute', right: 6, bottom: 4, fontWeight: 700 }}
                          >
                            Aisle
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 1.25 }} />
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {[
                { label: 'Empty', color: 'text.disabled', bg: 'background.neutral' },
                { label: 'Allocated', color: 'success.main', bg: 'success.lighter' },
                { label: 'Drop target', color: 'primary.main', bg: 'primary.lighter' },
                { label: 'Swap target', color: 'warning.main', bg: 'warning.lighter' },
                { label: 'Conflict', color: 'error.main', bg: 'error.lighter' },
              ].map((item) => (
                <Stack key={item.label} direction="row" spacing={0.75} alignItems="center">
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: 0.5,
                      border: '2px solid',
                      borderColor: item.color,
                      bgcolor: item.bg,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>

        <DragOverlay dropAnimation={dropAnimation} style={{ cursor: 'grabbing' }}>
          {dragGhost && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pl: 0.75,
                pr: 1.25,
                py: 0.75,
                width: 208,
                borderRadius: 2,
                bgcolor: 'background.paper',
                border: '1.5px solid',
                borderColor: 'primary.main',
                boxShadow: (t) =>
                  `0 1px 2px ${alpha(t.palette.common.black, 0.08)}, 0 12px 24px -6px ${alpha(t.palette.primary.main, 0.35)}`,
                cursor: 'grabbing',
                transform: 'rotate(-2deg)',
                pointerEvents: 'none',
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                }}
              >
                {dragGhost.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" fontWeight={800} noWrap display="block" sx={{ lineHeight: 1.35 }}>
                  {dragGhost.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.68rem', lineHeight: 1.2 }}>
                  {dragGhost.rollNo ? `Roll ${dragGhost.rollNo}` : ''}
                  {dragGhost.seatNumber ? ` · was #${dragGhost.seatNumber}` : ''}
                </Typography>
              </Box>
              <Iconify
                icon="mdi:cursor-move"
                width={16}
                sx={{ color: 'primary.main', flexShrink: 0, opacity: 0.85 }}
              />
            </Box>
          )}
        </DragOverlay>
    </Box>
  );
}
